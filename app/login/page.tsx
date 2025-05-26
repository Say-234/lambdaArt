'use client'

import "./login.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
    const [error, setError] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const router = useRouter()

    const { user } = useAuth()
    useEffect(() => {
        if (user) {
            router.push("/admin")
        }
    }, [user, router])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                router.push("/admin")
            })
            .catch((error) => {
                setError(true)
                // ..
            });

    }
    return (
        <div className="login">
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
                <input type="password" placeholder="Mot de pass" onChange={e=>setPassword(e.target.value)} />
                <button type="submit">Connexion</button>
                {error && <span>Mauvais Email ou Mots de passe !</span>}
            </form>
        </div>
    )
}

export default Login