import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import axios from 'axios';
import Layout from '../Layout';
import '../../styles/EditUser.css';

const EditProgram = () => {
  const { auth } = useAuth();
  const { programId } = useParams();
  const [program, setProgram] = useState(null);
  const [formData, setFormData] = useState({
    facultad: '',
    nombre: '',
    semestres: '',
    registroCalificado: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/programs/${programId}`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setProgram(response.data);
      setFormData({
        facultad: response.data.facultad,
        nombre: response.data.nombre,
        semestres: response.data.semestres,
        registroCalificado: response.data.registroCalificado
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');
      } else {
        console.error('Error al obtener el programa:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Formateo del campo "Registro Calificado"
    let formattedValue = value;
    if (name === 'registroCalificado') {
      formattedValue = formatRegistroCalificado(value);
    }

    setFormData({ ...formData, [name]: formattedValue });
  };

  const formatRegistroCalificado = (value) => {
    // Elimina cualquier carácter que no sea un número
    let cleanedValue = value.replace(/[^0-9]/g, '');

    // Formatear el valor a medida que se escribe
    let formattedValue = '';

    if (cleanedValue.length > 0) {
        formattedValue = cleanedValue.slice(0, 4);
      }
      if (cleanedValue.length > 3) {
        formattedValue += '-' + cleanedValue.slice(4, 5);
      }
      if (cleanedValue.length > 4) {
        formattedValue += ' | ' + cleanedValue.slice(5, 9);
      }
      if (cleanedValue.length > 8) {
        formattedValue += '-' + cleanedValue.slice(9, 10);
      }
    return formattedValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.facultad === '' || formData.facultad === 'seleccione') {
      window.alert('Seleccione una Facultad para el programa');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/programs/update/${programId}`, formData, {
        headers: {
          Authorization: auth.token,
        },
      });
      window.alert('Programa actualizado exitosamente');
      navigate('/programas');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        window.alert("El programa ya existe");
        return;
      }
      if (error.response && error.response.status === 401) {
        window.alert("La sesión caducó, debes iniciar sesión nuevamente");
        navigate('/login');
      } else {
        console.error('Error al actualizar el programa:', error);
      }
    }
  };

  if (!program) return <p>Loading...</p>;

  return (
    <Layout>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Editar Programa</p>
        <label>
          <select
            required
            className="input"
            name="facultad"
            value={formData.facultad}
            onChange={handleChange}
          >
            <option value="seleccione">Seleccione:</option>
            <option value="Ingeniería">Ingeniería</option>
            <option value="Ciencias Administrativas y Económicas">Ciencias Administrativas y Económicas</option>
            <option value="Educación y Ciencias Sociales">Educación y Ciencias Sociales</option>
            <option value="Derecho y Ciencias Forenses">Derecho y Ciencias Forenses</option>
            <option value="Ciencias Básicas y Áreas Comunes">Ciencias Básicas y Áreas Comunes</option>
          </select>
          <span>Facultad</span>
        </label>
        <label>
          <input
            required
            placeholder="Nombre"
            type="text"
            className="input"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          <span>Nombre</span>
        </label>
        <label>
          <input
            required
            placeholder="Semestres"
            type="number"
            className="input"
            name="semestres"
            value={formData.semestres}
            onChange={handleChange}
          />
          <span>Semestres</span>
        </label>
        <label>
          <input
            placeholder="Registro Calificado"
            type="text"
            className="input"
            name="registroCalificado"
            value={formData.registroCalificado}
            onChange={handleChange}
          />
          <span>Registro Calificado</span>
        </label>
        <button className="submit">Actualizar</button>
      </form>
    </Layout>
  );
};

export default EditProgram;