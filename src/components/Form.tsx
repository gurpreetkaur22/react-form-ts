import { useState, type FormEvent, type ChangeEvent, useEffect } from "react"

interface userProfile {
    firstname: string,
    lastname: string,
    email: string,
    age: number | string,
    address: string
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
    const [currentPage, setCurrentPage] = useState<number>(1);
    const usersPerPage = 5;

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(allUsers.length / usersPerPage)


    useEffect(() => {
        fetchUsers();
    }, [])


    const fetchUsers = () => {
        const request = indexedDB.open("userDatabase", 1);
        request.onsuccess = () => {
            const db = request.result;
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

        //open or create the database 
        const request = indexedDB.open("userDatabase", 1);

        request.onupgradeneeded = ((e: IDBVersionChangeEvent) => {
            const target = e.target as IDBOpenDBRequest;
            const db: IDBDatabase = target.result;
            db.createObjectStore("users", { keyPath: "email" });
        })

        request.onsuccess = ((e: Event) => {
            const target = e.target as IDBOpenDBRequest;
            const db: IDBDatabase = target.result;
            const transaction = db.transaction("users", "readwrite");
            const store = transaction.objectStore("users");

            store.add(formData);
            fetchUsers();
            setIsSubmitted(true);
            console.log("Data stored in IndexedDB!");
        })
    }


    return (
        <>

            <div className="form-container">
                {!isSubmitted &&
                    <form action="" className="form" onSubmit={submitHandler}>
                        <h1>Sign Up Form</h1>
                        <div className="form-container">
                            <div className="single-div">
                                <label>Firstname: </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter firstname"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange} />
                            </div>
                            <div className="single-div">
                                <label>Lastname: </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter lastname"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange} />
                            </div>
                            <div className="single-div">
                                <label>Email: </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="Enter email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange} />
                            </div>
                            <div className="single-div">
                                <label>Age: </label>
                                <input
                                    required
                                    type="number"
                                    placeholder="Enter age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange} />
                            </div>
                            <div className="single-div">
                                <label>Address: </label>
                                <textarea
                                    required
                                    rows={4}
                                    style={{ width: '25em' }}
                                    placeholder="Enter address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange} />
                            </div>
                        </div>
                        <button>Submit</button>
                    </form>}

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