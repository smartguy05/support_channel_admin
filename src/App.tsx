import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import CollectionAdminPage from "./componets/CollectionAdminPage";
import ChannelAdminPage from "./componets/ChannelAdmin";
import Navbar from "./componets/Navbar";
import HomePage from "./componets/HomePage";

function App() {
	return (
		<div className="App">
			<Navbar />
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/channels" element={<ChannelAdminPage />} />
				<Route path="/collections" element={<CollectionAdminPage />} />
			</Routes>
		</div>
	);
}

export default App;
