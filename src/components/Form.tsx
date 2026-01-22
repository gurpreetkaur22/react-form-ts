import { useState, type FormEvent, type ChangeEvent, useEffect } from "react"

interface userProfile {
    firstname: string,
    lastname: string,
    email: string,
    age: number | string,
    address: string
}

interface formErrors {
    firstname?: string,
    lastname?: string,
    email?: string,
    age?: string,
    address?: string
}

const Form = () => {

    const [formData, setFormData] = useState<userProfile>({
        firstname: '',
        lastname: '',
        email: '',
        age: '',
        address: ''
    })
    const [isSubmitted, setIsSubmitted] = useState<Boolean>(false);
    const [allUsers, setAllUsers] = useState<userProfile[]>([]);
    const [errors, setErrors] = useState<formErrors>({})
    const [currentPage, setCurrentPage] = useState<number>(1);
    const usersPerPage = 5;

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(allUsers.length / usersPerPage)


    useEffect(() => {
        fetchUsers();
    }, [])

    const validate = (): boolean => {
        const newErrors: formErrors = {};

        if (!formData.firstname.trim()) {
            newErrors.firstname = "First name is required!";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email is required!";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address!";
        }

        const ageNum = Number(formData.age);
        if (!formData.age) {
            newErrors.age = "Age is required!";
        } else if (isNaN(ageNum)) {
            newErrors.age = "Please enter valid age!";
        }

        if (formData.address.length < 10) {
            newErrors.address = "Address must be at least 10 characters long!";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;

    }


    const fetchUsers = () => {
        const request = indexedDB.open("userDatabase", 1);

        request.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains("users")) {
                db.createObjectStore("users", { keyPath: "email" });
            }
        }

        request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("users")) return;

            const transaction = db.transaction("users", "readonly");
            const store = transaction.objectStore("users");

            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                setAllUsers(getAllRequest.result);
            }
        }
    }


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "age" ? (value === "" ? "" : parseInt(value)) : value
        }))
    }


    const submitHandler = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = validate();

        if (isValid) {
            //open or create the database 
            const request = indexedDB.open("userDatabase", 1);

            request.onsuccess = ((e: Event) => {
                const target = e.target as IDBOpenDBRequest;
                const db: IDBDatabase = target.result;
                const transaction = db.transaction("users", "readwrite");
                const store = transaction.objectStore("users");

                const addRequest = store.add(formData);

                addRequest.onsuccess = () => {
                    fetchUsers();
                    setFormData({
                        firstname: '',
                        lastname: '',
                        email: '',
                        age: '',
                        address: ''
                    })
                    setIsSubmitted(true);
                    console.log("Data stored in IndexedDB!");
                }
                addRequest.onerror = () => {
                    console.log("Error adding user. (likely a duplicate user)")
                }
            })
        } else {
            console.log("Validation failed!")
        }
    }


    return (
        <>
            <div className="form-container">
                <form action="" className="form" onSubmit={submitHandler}>
                    <h1>Sign Up Form</h1>
                    <div className="form-container">
                        <div className="single-div">
                            <label>Firstname: </label>
                            <div className="input-err">
                                <input
                                    type="text"
                                    placeholder="Enter firstname"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange} />
                                {errors.firstname && <span>{errors.firstname}</span>}
                            </div>
                        </div>
                        <div className="single-div">
                            <label>Lastname: </label>
                            <input
                                type="text"
                                placeholder="Enter lastname"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange} />
                        </div>
                        <div className="single-div">
                            <label>Email: </label>
                            <div className="input-err">
                                <input
                                    // type="email"
                                    placeholder="Enter email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange} />
                                {errors.email && <span>{errors.email}</span>}
                            </div>
                        </div>
                        <div className="single-div">
                            <label>Age: </label>
                            <div className="input-err">
                                <input
                                    type="number"
                                    placeholder="Enter age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange} />
                                {errors.age && <span>{errors.age}</span>}
                            </div>
                        </div>
                        <div className="single-div">
                            <label>Address: </label>
                            <div className="input-err">
                                <textarea
                                    rows={4}
                                    style={{ width: '25em' }}
                                    placeholder="Enter address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange} />
                                    {errors.address && <span>{errors.address}</span>}
                            </div>
                        </div>
                    </div>
                    <button>Submit</button>
                </form>

                <div className="user-data">
                    <h1>User Data</h1>
                    <table>
                        <thead>
                            <tr>
                                <th className="t-sNo">S.No.</th>
                                <th className="t-firstName">Firstname</th>
                                <th className="t-lastName">Lastname</th>
                                <th className="t-email">Email</th>
                                <th className="t-age">Age</th>
                                <th className="t-address">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user, index) => (
                                <tr key={user.email}>
                                    <td>{indexOfFirstUser + index + 1}</td>
                                    <td>{user.firstname}</td>
                                    <td>{user.lastname}</td>
                                    <td>{user.email}</td>
                                    <td>{user.age}</td>
                                    <td className="truncate" title={user.address}>{user.address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="btns">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                        <span>{currentPage} of {totalPages || 1}</span>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Form