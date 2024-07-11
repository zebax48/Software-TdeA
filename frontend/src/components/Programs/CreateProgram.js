import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import axios from 'axios';
import Layout from '../Layout';
import '../../styles/EditUser.css';

const CreateProgram = () => {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    facultad: '',
    nombre: '',
    semestres: '',
    registroCalificado: ''
  });
  const navigate = useNavigate();

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
    if (cleanedValue.length > 4) {
      formattedValue += '-' + cleanedValue.slice(4, 6);
    }
    if (cleanedValue.length > 6) {
      formattedValue += ' | ' + cleanedValue.slice(6, 10);
    }
    if (cleanedValue.length > 10) {
      formattedValue += '-' + cleanedValue.slice(10, 11);
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
      await axios.post('http://localhost:5000/api/programs/create', formData, {
        headers: {
          Authorization: auth.token,
        },
      });
      window.alert('Programa creado exitosamente');
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
        console.error('Error al crear el programa:', error);
      }
    }
  };

  return (
    <Layout>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Crear Programa</p>
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
        <button className="submit">Crear</button>
      </form>
    </Layout>
  );
};

export default CreateProgram;