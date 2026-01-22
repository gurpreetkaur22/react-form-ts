import { useState, type FormEvent, type ChangeEvent, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"

interface userProfile {
    firstname: string,
    lastname: string,
    email: string,
    age: number,
    address: string
}

const userSchema = z.object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    age: z.coerce.number({
        message: "Age is required",
    })
        .min(1, "Age is required")
        .max(120, "Please enter a valid age"), address: z.string().min(10, "Address must be at least 10 characters long")
})

const Form = () => {

    const { register, handleSubmit, reset, formState: { errors } } = useForm<userProfile>({
        resolver: zodResolver(userSchema),
        defaultValues: { firstname: '', lastname: '', email: '', age: '' as unknown as number, address: '' }
    })
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


    const onSubmit = (data: userProfile) => {

        //open or create the database 
        const request = indexedDB.open("userDatabase", 1);

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction("users", "readwrite");
            const store = transaction.objectStore("users");

            const addRequest = store.add(data);

            addRequest.onsuccess = () => {
                fetchUsers();
                reset();
                console.log("Data stored in IndexedDB!");
            }
            addRequest.onerror = () => {
                console.log("Error adding user. (likely a duplicate user)")
            }
        }
    }


    return (
        <>
            <div className="form-container">
                <form action="" className="form" onSubmit={handleSubmit(onSubmit)}>
                    <h1>Sign Up Form</h1>
                    <div className="form-container">
                        <div className="single-div">
                            <label>Firstname: </label>
                            <div className="input-err">
                                <input
                                    type="text"
                                    placeholder="Enter firstname"
                                    {...register("firstname")} />
                                {errors.firstname && <span>{errors.firstname.message}</span>}
                            </div>
                        </div>
                        <div className="single-div">
                            <label>Lastname: </label>
                            <input
                                type="text"
                                placeholder="Enter lastname"
                                {...register("lastname")} />
                        </div>
                        <div className="single-div">
                            <label>Email: </label>
                            <div className="input-err">
                                <input
                                    // type="email"
                                    placeholder="Enter email"
                                    {...register("email")} />
                                {errors.email && <span>{errors.email.message}</span>}
                            </div>
                        </div>
                        <div className="single-div">
                            <label>Age: </label>
                            <div className="input-err">
                                <input
                                    type="number"
                                    placeholder="Enter age"
                                    {...register("age")} />
                                {errors.age && <span>{errors.age.message}</span>}
                            </div>
                        </div>
                        <div className="single-div">
                            <label>Address: </label>
                            <div className="input-err">
                                <textarea
                                    rows={4}
                                    style={{ width: '25em' }}
                                    placeholder="Enter address"
                                    {...register("address")}
                                />
                                {errors.address && <span>{errors.address.message}</span>}
                            </div>
                        </div>
                    </div>
                    <button type="submit">Submit</button>
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
                    {/* <div className="btns">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                        <span>{currentPage} of {totalPages || 1}</span>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                    </div> */}
                    <Stack spacing={2} sx={{ marginTop: 2, alignItems: "center" }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={(event, value) => setCurrentPage(value)}
                            variant="outlined"
                            shape="rounded"
                        />
                    </Stack>
                </div>
            </div>

        </>
    )
}

export default Form