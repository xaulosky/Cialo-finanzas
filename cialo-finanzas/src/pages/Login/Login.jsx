import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Login.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const { user, signIn, signUp } = useAuth()

    // Si ya está autenticado, redirigir al dashboard
    if (user) {
        return <Navigate to="/" replace />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password)
                if (error) throw error
                setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.')
            } else {
                const { error } = await signIn(email, password)
                if (error) throw error
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon">💰</span>
                        <h1>Cialo Finanzas</h1>
                    </div>
                    <p className="login-subtitle">
                        {isSignUp ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="alert alert-error">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <span className="btn-loading">
                                <span className="spinner"></span>
                                Procesando...
                            </span>
                        ) : (
                            isSignUp ? 'Crear cuenta' : 'Iniciar sesión'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setError('')
                                setMessage('')
                            }}
                        >
                            {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
