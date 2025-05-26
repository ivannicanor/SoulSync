const AbrirAdmin = () => {
  const token = localStorage.getItem('token');

  const abrirAdmin = () => {
    if (!token) {
      alert('No tienes token, inicia sesión');
      return;
    }
    // Abre la ruta admin en nueva pestaña
    window.open('http://localhost:8000/admin/login', '_blank');
  };

  return (
    <button onClick={abrirAdmin} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
      Ir a panel Admin
    </button>
  );
};

export default AbrirAdmin;
