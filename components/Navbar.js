import Link from "next/link";
import React, { useEffect } from "react";
import { useState } from "react";

const Navbar = () => {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isActive, setActive] = useState(false);
  const [navbar, setNavbar] = useState("navbar");
  const changeBackground = () => {
    if (window.scrollY >= 0.5) {
      setNavbar("sticky");
    } else {
      setNavbar("navbar");
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
  }, []);
  function handleClick() {
    setMobileNavOpen(!isMobileNavOpen);
    setActive(!isActive);
  }
  return (
    <>
      <div class="nav-wrapper">
        <div class="grad-bar"></div>
        <nav class={navbar}>
          <Link href="/">
            <img src="/images/logo.webp" alt="Company Logo" />
          </Link>
          <div
            class={`menu-toggle ${isActive ? "is-active" : ""}`}
            id="mobile-menu"
            onClick={handleClick}
          >
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
          <ul class={`nav ${isMobileNavOpen ? "mobile-nav" : ""}`}>
            <li
              class="nav-item"
              style={{ textAlign: "center", marginLeft: "14px" }}
            >
              <Link href="/">Home</Link>
            </li>
            <li class="nav-item">
              <div class="dropdown">
                <button class="dropbtn">
                  Solutions
                  <i
                    class="fa-solid fa-chevron-down"
                    style={{ marginLeft: "7px", fontSize: "13px" }}
                  ></i>
                </button>
                <div class="dropdown-content">
                  <div className="area-content">
                    <Link href="/career">Career</Link>
                    <Link href="/healthcare">Midas Healthcare</Link>
                    {/* <Link href="/lifescience">Midas Life Sciences</Link> */}
                    {/* <Link href="/technology">Midas Technology</Link> */}
                  </div>
                </div>
              </div>
            </li>
            <li class="nav-item">
              <div class="dropdown">
                <button class="dropbtn">
                  Company
                  <i
                    class="fa-solid fa-chevron-down"
                    style={{ marginLeft: "7px", fontSize: "13px" }}
                  ></i>
                </button>
                <div class="dropdown-content">
                  <div className="area-content">
                    <Link href="/diversity">Diversity</Link>
                    <Link href="/news">News & Events</Link>
                  </div>
                </div>
              </div>
            </li>
            {/* <li class="nav-item" style={{textAlign:"center"}}><a href="#">Why Us</a></li> */}
            <li class="nav-item contact-btn" style={{ textAlign: "center" }}>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
