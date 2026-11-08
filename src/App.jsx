import { useState, useRef, useEffect } from "react"
import SideBar from "./components/SideBar"
import Message from "./components/Message"
import ChatInput from "./components/ChatInput"
import { generarExamen } from "./api"

function App() {
    const [archivo, setArchivo] = useState(null)
    const [cantidad, setCantidad] = useState(5)
    const [dificultad, setDificultad] = useState("Fácil")
    const [tipo, setTipo] = useState("ambos")
    const [mensajes, setMensajes] = useState([])
    const final = useRef(null)
    const [cargando, setCargando] = useState(false)
    const [historial, setHistorial] = useState([])
    const [chatAbierto, setChatAbierto] = useState(null)
    useEffect(() => {
        final.current?.scrollIntoView({ behavior: "smooth" })
    }, [mensajes])
    const enviar = async () => {
        if (!archivo || cargando) return
        const miMensaje = `📄 ${archivo.name}\n${cantidad} preguntas · ${dificultad} · ${tipo}`
        setMensajes([...mensajes, { quien: "yo", texto: miMensaje }])
        setCargando(true)
        try {
            const { examen } = await generarExamen(archivo, { cantidad, dificultad, tipo })
            setMensajes((antes) => [...antes, { quien: "bot", texto: examen }])
        } catch (error) {
            setMensajes((antes) => [...antes, { quien: "bot", texto: `❌ No pude conectar con la IA (${error.message}). ¿Está corriendo Colab y VITE_API_URL en .env es la correcta?` }])
        }
        setArchivo(null)
        setCargando(false)
    }
    const guardarChatActual = () => {
        if (mensajes.length === 0) return { lista: historial, corrimiento: 0 }
        if (chatAbierto !== null) {
            const lista = historial.map((c, j) => (j === chatAbierto ? { ...c, mensajes: mensajes } : c))
            return { lista, corrimiento: 0 }
        }
        const titulo = mensajes[0].texto.split("\n")[0]
        return { lista: [{ titulo, mensajes }, ...historial], corrimiento: 1 }
    }
    const nuevoChat = () => {
        if (cargando) return
        setHistorial(guardarChatActual().lista)
        setMensajes([])
        setChatAbierto(null)
    }
    const abrirChat = (i) => {
        if (cargando) return
        const { lista, corrimiento } = guardarChatActual()
        const posicion = i + corrimiento
        setHistorial(lista)
        setMensajes(lista[posicion].mensajes)
        setChatAbierto(posicion)
    }

    return (
        <div className="h-full flex">

            <SideBar historial={historial} nuevoChat={nuevoChat} abrirChat={abrirChat} chatAbierto={chatAbierto} />

            <div className="flex-1 flex flex-col">
                <h2 className="text-xl font-bold p-4 bg-white shadow-sm">PIA - REDES NEURONALES</h2>

                <div className="flex-1 overflow-y-auto p-4">
                    {mensajes.length === 0 && (
                        <p className="text-center text-[#075e54]/60 text-xl mt-20">
                            ¿Qué estudiamos hoy? 📚
                        </p>
                    )}
                    {mensajes.map((m, i) => (
                        <Message key={i} quien={m.quien} texto={m.texto} />
                    ))}
                    {cargando && <p className="text-zinc-500 italic mt-2 text-right">Generando examen... ⏳ (puede tardar 1-2 minutos)</p>}
                    <div ref={final}></div>
                </div>

                <ChatInput
                    archivo={archivo} setArchivo={setArchivo}
                    cantidad={cantidad} setCantidad={setCantidad}
                    dificultad={dificultad} setDificultad={setDificultad}
                    tipo={tipo} setTipo={setTipo}
                    enviar={enviar} cargando={cargando}
                />
            </div>
        </div>
    )
}

export default App
