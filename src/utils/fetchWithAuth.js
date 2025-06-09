export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    try {
        const response = await fetch(url, { ...options, headers });

        // Si el token es inválido o expirado, redirigir al inicio de sesión
        if (response.status === 401) {
            localStorage.removeItem("token"); // Eliminar el token almacenado
            window.location.href = "/"; // Redirigir al inicio de sesión
            return; // Detener la ejecución
        }

        // Si hay un nuevo token en los encabezados, actualizarlo
        const newToken = response.headers.get("Authorization");
        if (newToken) {
            localStorage.setItem("token", newToken.split(" ")[1]);
        }

        return response;
    } catch (error) {
        console.error("Error en la solicitud:", error);
        // Opcional: Redirigir al inicio de sesión en caso de error de red
        window.location.href = "/";
    }
};