import {useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import './formulario.css';

function Formulario() {
  const[formData, setFormData] = useState({
    usuario: "",
    tipoUnidad: "",
    fecha:""
  });

  const handleChange = (e) => {
    const {name,value} = e.target;
    setFormData((prev) => ({...prev, [name]:value}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados: ', formData);
    alert(`Formulario enviado por: ${formData.usuario}`);
  };

  return (
    <div className='contenedor'>
      <form onSubmit={handleSubmit} className="formulario">

        <div>
          <label htmlFor="usuario"> Nombre usuario</label>
          <input type="text" id="usuario" name="usuario" value={formData.usuario} onChange={handleChange} required></input>
        </div>

        <div>
          <label htmlFor="Fecha"> Fecha</label>
          <input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleChange} required></input>
        </div>

        <div>
          <label htmlFor="TipoUnidad">Tipo Unidad</label>
          <select id="tipoUnidad" name="tipoUnidad" value={formData.tipoUnidad} onChange={handleChange} required>
            <option value="">Selecciona una opcion</option>
            <option value="habitacion">Habitacion</option>
            <option value="cabana">Cabaña</option>
          </select>
        </div>

        <button type="submit" className="Boton">Enviar</button>

      </form>
    </div>

  );
}

export default Formulario;