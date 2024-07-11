import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/styles.css';
import Layout from './components/Layout';

const Dashboard = () => {
  const navigate = useNavigate();

  const containers = [
    {
      title: 'PRUEBAS',
      imgSrc: '/assets/crear.png',
      route: '/pruebas' // Añade la ruta específica aquí
    },
    {
      title: 'RA',
      imgSrc: '/assets/ra.png',
      route: '/ra' // Añade la ruta específica aquí
    },
    {
      title: 'PROGRAMAS',
      imgSrc: '/assets/programa.png',
      route: '/programas' // Añade la ruta específica aquí
    },
    {
      title: 'USUARIOS',
      imgSrc: '/assets/user.png',
      route: '/users' // Añade la ruta específica aquí
    }
  ];

  return (
    <Layout>
      <div className="app">
        <h1>DASHBOARD</h1>
        <div className="programs-container">
          {containers.map((container, index) => (
            <div 
              key={index} 
              className="program-card"
              onClick={() => navigate(container.route)}
            >
              <img src={container.imgSrc} alt={container.title} />
              <h3>{container.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;