const AbrirAdmin = () => {
  const token = localStorage.getItem('token');

  const abrirAdmin = () => {
    if (!token) {
      alert('No tienes token, inicia sesión');
      return;
    }
    // Abre la ruta admin en nueva pestaña
    window.open('http://localhost:8000/api/admin', '_blank');
  };

  return (
    <button onClick={abrirAdmin} className="btn-admin">
      Ir a panel Admin
    </button>
  );
};

export default AbrirAdmin;
