import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav style={styles.nav}>
            <ul style={styles.ul}>
                {/*<li style={styles.li}>*/}
                {/*    <Link to="/" style={styles.link}>Home</Link>*/}
                {/*</li>*/}
                <li style={styles.li}>
                    <Link to="/channels" style={styles.link}>Channels</Link>
                </li>
                <li style={styles.li}>
                    <Link to="/collections" style={styles.link}>Collections</Link>
                </li>
            </ul>
        </nav>
    );
}

const styles = {
    nav: {
        padding: '10px',
        backgroundColor: '#333',
    },
    ul: {
        listStyleType: 'none',
        display: 'flex',
        margin: 0,
        padding: 0,
    },
    li: {
        marginRight: '20px',
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
    },
};

export default Navbar;