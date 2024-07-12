import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import axios from 'axios';
import Layout from '../Layout';
import '../../styles/EditUser.css';

const EditRA = () => {
  const { auth } = useAuth();
  const { raId } = useParams();
  const [ra, setRA] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    facultad: '',
    descripcion: ''
  });
  const [programas, setProgramas] = useState([]);
  const [allProgramas, setAllProgramas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRA();
    fetchAllProgramas();
  }, [raId]);

  const fetchRA = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/ra/${raId}`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setRA(response.data);
      setFormData({
        nombre: response.data.nombre,
        facultad: response.data.facultad,
        descripcion: response.data.descripcion
      });
      setProgramas(response.data.programas);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.alert('La sesión caducó, debes iniciar sesión nuevamente');
        navigate('/login');
      } else {
        console.error('Error al obtener el resultado de aprendizaje:', error);
      }
    }
  };

  const fetchAllProgramas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/programs', {
        headers: {
          Authorization: auth.token,
        },
      });
      setAllProgramas(response.data);
    } catch (error) {
      console.error('Error al obtener los programas:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.facultad === '' || formData.facultad === 'seleccione') {
        window.alert('Seleccione una Facultad para el programa');
        return;
      }

    try {
      await axios.put(`http://localhost:5000/api/ra/update/${raId}`, formData, {
        headers: {
          Authorization: auth.token,
        },
      });
      window.alert('Resultado de Aprendizaje actualizado exitosamente');
      navigate('/ra');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        window.alert('El resultado de aprendizaje ya existe');
        return;
      }
      if (error.response && error.response.status === 401) {
        window.alert('La sesión caducó, debes iniciar sesión nuevamente');
        navigate('/login');
      } else {
        console.error('Error al actualizar el resultado de aprendizaje:', error);
      }
    }
  };

  const handleAddProgram = async (programId) => {
    try {
      await axios.post('http://localhost:5000/api/ra/add-programs', {
        raId,
        programIds: [programId]
      }, {
        headers: {
          Authorization: auth.token,
        },
      });
      window.alert('Programa agregado al RA exitosamente');
      fetchRA();
    } catch (error) {
        if (error.response && error.response.status === 401) {
            window.alert('La sesión caducó, debes iniciar sesión nuevamente');
            navigate('/login');
          } else {
            window.alert('Error al agregar el programa al resultado de aprendizaje');
            console.error('Error al agregar el programa al resultado de aprendizaje:', error);
          }
    }
  };

  const handleRemoveProgram = async (programId) => {
    try {
      await axios.post('http://localhost:5000/api/ra/remove-programs', {
        raId,
        programIds: [programId]
      }, {
        headers: {
          Authorization: auth.token,
        },
      });
      window.alert('Programa excluido del RA exitosamente')
      fetchRA();
    } catch (error) {
        if (error.response && error.response.status === 401) {
            window.alert('La sesión caducó, debes iniciar sesión nuevamente');
            navigate('/login');
          } else {
            window.alert('Error al excluir el programa al resultado de aprendizaje');
            console.error('Error al excluir el programa al resultado de aprendizaje:', error);
          }
    }
  };

  if (!ra) {
    return <div>No hay RA para mostrar...</div>;
  }

  return (
    <Layout>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Editar RA</p>
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
            placeholder="Descripción"
            type="text"
            className="input"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
          />
          <span>Descripción</span>
        </label>
        <button className="submit">Actualizar</button>
      </form>

      <h2>Programas Asociados</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre del Programa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {programas.map((program) => (
            <tr key={program._id}>
              <td>{program.nombre}</td>
              <td>
                <button onClick={() => handleRemoveProgram(program._id)} className="button">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Agregar Programas al RA</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre del Programa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {allProgramas
            .filter((program) => !programas.some((p) => p._id === program._id))
            .map((program) => (
              <tr key={program._id}>
                <td>{program.nombre}</td>
                <td>
                  <button onClick={() => handleAddProgram(program._id)} className="button">
                    Agregar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default EditRA;