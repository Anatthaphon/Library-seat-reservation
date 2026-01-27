import React from "react";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div className="topbar-left">
          <span className="menu-icon">☰</span>
          <span className="logo">Library</span>
        </div>
        <div className="topbar-right">
          <span>TH</span>
          <span className="user-id">63030103</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay">
          <h1>Library's seat reservation</h1>
        </div>
      </section>

      <section className="section">
        <h2>แผนผังห้องสมุด ชั้น 2</h2>
        <p className="section-subtitle">พื้นที่สำหรับผังที่นั่ง</p>
        <div className="layout-placeholder">
          พื้นที่สำหรับผังที่นั่ง
        </div>
      </section>

      <div 
        className="reservation-preview"
        onClick={() => navigate("/reserve")}
        role="button"
      >
        <span>
          reservation
          <br />
          จองที่นั่ง
        </span>
      </div>

      <p className="reservation-note">
        หากทำการจองที่นั่งแล้ว สามารถยกเลิกที่นั่งได้ก่อนวันที่ท่านจะใช้งาน
        <br />
        หากต้องการยกเลิกในวันที่ท่านใช้งาน
        <br />
        กรุณาติดต่อเจ้าหน้าที่ 08x-xxxxxxx ในเวลา 08:30 - 16:30 น.
      </p>

      <section className="section agreement">
        <h3>ข้อตกลง</h3>
        <p>
          ผู้ใช้สามารถจองที่นั่งล่วงหน้าได้ไม่เกิน 2 วัน และสามารถใช้งานได้สูงสุด 3 ชั่วโมงต่อครั้ง
          หากต้องการใช้งานเกินระยะเวลาที่กำหนด โปรดทำการจองใหม่
          <br />
          ระบบอนุญาตให้ยกเลิกการจองได้ไม่เกิน 3 ครั้งต่อเดือน
        </p>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h4>Contact Us</h4>
            <p>งานทรัพยากรการเรียนรู้ (ห้องสมุดวิทยาศาสตร์)</p>
            <p>มหาวิทยาลัยนเรศวร วิทยาเขตศรีราชา</p>
            <p>เลขที่ 199 หมู่ 6 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230</p>
            <p>โทรศัพท์: 065 716 2632</p>
          </div>

          <div>
            <h4>เวลาทำการช่วงเปิดภาคเรียน</h4>
            <p>เปิดให้บริการ</p>
            <p>วันจันทร์ - วันเสาร์ เวลา 9.00 - 18.00</p>
            <br />
            <p>ปิดให้บริการ</p>
            <p>วันอาทิตย์ และ วันหยุดนักขัตฤกษ์</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;

/*hello Nadia */
