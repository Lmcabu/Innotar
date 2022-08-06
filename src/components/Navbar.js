import React, { Component } from "react";
const Navbar = () => {
  return (
    <nav className="navbar">
      <h1> digiXnode </h1>
      <div className="links">
        <a href="/"> Home </a>
        <a href="/certify"> Notarize </a>
        <a href="/vertify"> Verify </a>
        <a href="/fetch"> Get your doc </a>
        {/* <a href="/fetch" style={{
					color:"white",
					backgroundColor:"#f1356d",
					borderRadius:'8px'
				}
				}>Fetch</a> */}
      </div>
    </nav>
  );
};

export default Navbar;