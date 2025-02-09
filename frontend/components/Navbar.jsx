import { Link } from "react-router-dom";
import "../src/index.css"
import React from 'react';

import { useNavigate } from "react-router-dom";
export default function Navbar() {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
      
        return (
          <nav className="flexyNav">
            {!isAuthenticated && (
              <>
                <Link to="/signup">
                  <button className="black">Signup</button>
                </Link>
                <Link to="/signin">
                  <button className="black">Signin</button>
                </Link>
              </>
            )}
          </nav>
        );
}
