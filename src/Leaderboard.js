import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const Leaderboard = ({ userId }) => {
    const [activeTab, setActiveTab] = useState("Сегодня");
    const [leaderboardItems, setLeaderboardItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jwt, setJwt] = useState("");  
    const host = "https://";
    
    const fetchRatings = async (filter) => {
        try {
            const response = await axios.post(`${host}/api/v1/ratings`, { filter }, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });
            console.log("Данные рейтинга:", response.data);
            setLeaderboardItems(response.data.data.items);
            setLoading(false);
        } catch (error) {
            console.error("Ошибка при получении рейтинга:", error);
            setLoading(false);
        }
    }; 

    useEffect(() => {
        const storedJwt = localStorage.getItem("jwt");
        if (storedJwt) {
            setJwt(storedJwt); 
        } else {
            axios
                .post(`${host}/api/v1/user/login`, {
                    email: "test@",
                    password: "qwe12345",
                })
                .then((res) => {
                    const token = res.data.data.jwt;
                    setJwt(token);
                    localStorage.setItem("jwt", token); 
                })
                .catch((error) => {
                    console.error("Ошибка при получении токена:", error);
                });
        }
    }, []);

    useEffect(() => {
        // console.log("JWT:", jwt); 
    }, [jwt]);

    useEffect(() => {
        const filterMap = {
            Сегодня: "today",
            Вчера: "yesterday",
            Неделя: "week",
            Месяц: "month",
            Год: "year",
        };

        if (jwt) {
            fetchRatings(filterMap[activeTab]);
        }
    }, [activeTab, jwt]);

    return (
        <div className="leaderboardWrapper">
            <h1 className="leaderboard-title">Список лидеров</h1>

            <div className="tabs">
                {["Сегодня", "Вчера", "Неделя", "Месяц", "Год"].map((tab) => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading && <div>Загрузка...</div>}

            {!loading && leaderboardItems.length === 0 && (
                <div>Нет данных для отображения</div>
            )}

            <div className="leaderboard">
                {leaderboardItems.map((item) => (
                    <div className="leaderboard-card" key={item.id}>
                        {/* <img
                            className="profile-pic"
                            src={item.preview || "/img/avatar.png"}
                            alt="Profile"
                        /> */}
                        <div className="card-content">
                            <p className="name">{item.name || "Без имени"}</p>
                            <p className="score">{item.total_score || "Нет"} очков</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
