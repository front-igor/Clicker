import React, { useReducer, useState, useEffect } from "react";
import "./App.css";
import Leaderboard from "./Leaderboard";
import axios from "axios";

const ActionTypes = {
  INCREMENT_CLICKS: "INCREMENT_CLICKS",
  RESET_CLICKS: "RESET_CLICKS",
  SET_CLICKS: "SET_CLICKS",
};

const initialState = {
  clicks: 0,
};

const host = "https://";

const clickSound = new Audio('/sound/click-sound.mp3'); 

const isMobileDevice = () => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || typeof window.orientation !== "undefined";

  const isTrusted =
    window.Telegram?.WebApp?.initDataUnsafe?.user?.is_premium ||
    window.isSecureContext;

  return isMobile && isTrusted;
};

const clickerReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.INCREMENT_CLICKS:
      return { clicks: Number(state.clicks) + 1 };
    case ActionTypes.RESET_CLICKS:
      return { clicks: 0 };
    case ActionTypes.SET_CLICKS:
      return { clicks: action.payload };
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(clickerReducer, initialState);
  const [currentPage, setCurrentPage] = useState("clicker");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [jwt, setJwt] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mobile = isMobileDevice();
    setIsMobile(mobile);
    if (!mobile) {
      console.error(
        "Приложение доступно только на мобильных устройствах в доверенной среде."
      );
    }
    const handleOrientationChange = () => {
      setIsMobile(isMobileDevice());
    };
    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    tg.onEvent("viewportChanged", function () {
      if (tg.isDesktop) {
        tg.close();
      }
    });

    return () => {
      tg.offEvent("viewportChanged");
    };
  }, []);

  const checkProfileExists = async (idUserTg) => {
    try {
      const response = await axios.get(`${host}/api/v1/profiles/${idUserTg}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при проверке профиля:", error);
      return null;
    }
  };

  const createProfile = async () => {
    try {
      const tg = window.Telegram.WebApp;
      const userData = tg.initDataUnsafe.user;
      const response = await axios.post(
        `${host}/api/v1/profiles`,
        { id_user_tg: userData.id, name: userName },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании профиля:", error);
      return null;
    }
  };

  const updateScore = async (score) => {
    if (score > 20) score = 20;
    try {
      const tg = window.Telegram.WebApp;
      const userData = tg.initDataUnsafe.user;

      const response = await axios.put(
        `${host}/api/v1/profiles/score/${userData.id}`,
        { score: 1 },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении очков:", error);
    }
  };

  const fetchTelegramUserId = async () => {
    try {
      const tg = window.Telegram.WebApp;
      const userData = tg.initDataUnsafe.user;

      if (userData) {
        const firstName = userData.first_name || "";
        const lastName = userData.last_name || "";
        const name = `${firstName} ${lastName}`.trim();

        const loginResponse = await axios.post(`${host}/api/v1/user/login`, {
          email: "test@",
          password: "qwe12345",
        });

        const token = loginResponse.data.data.jwt;
        setJwt(token);
        localStorage.setItem("jwt", token);
        const idUserTg = loginResponse.data.data.id_user_tg;

        setUserName(name);
        return idUserTg;
      } else {
        console.error("Нет данных о пользователе Telegram");
        return null;
      }
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      return null;
    }
  };

  useEffect(() => {
    const getUserIdFromTelegram = async () => {
      const telegramUserId = await fetchTelegramUserId();
      setUserId(telegramUserId);
    };
    getUserIdFromTelegram();
  }, []);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const userData = tg.initDataUnsafe.user;

    const createProfileNEW = async () => {
      if (jwt) {
        const profile = await checkProfileExists(userData.id);
        if (!profile?.data?.model) {
          const newProfile = await createProfile(userData.id);
          if (newProfile) {
            setIsRegistered(true);
          }
        } else {
          setIsRegistered(true);
          dispatch({
            type: ActionTypes.SET_CLICKS,
            payload: profile.data.model.score || 0,
          });
        }
      }
    };
    createProfileNEW();
  }, [jwt]);

  const handleCircleClick = async (event) => {
    if (!event.isTrusted) {
      console.warn("Это был программный клик!");
      return;
    }
    dispatch({ type: ActionTypes.INCREMENT_CLICKS });

    clickSound.currentTime = 0;
    clickSound.play();

    if (state.clicks > 0) {
      await updateScore(state.clicks);
    } else {
      console.log("Не зарегистрирован или нет кликов");
    }
  };

  if (!isMobile) {
    return (
      <div className="App no-mobil">
        <h1 className="no-mobil__title">
          Это приложение доступно только на мобильных устройствах.
        </h1>
        <img className="no-mobil__img" src="" alt="qr-code" />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="AppWrapper">
        {currentPage === "clicker" ? (
          <div className="clicker">
            <div className="info">
              <img
                className="img-heart"
                src="/img/noto_red-heart.svg"
                alt="icon-heart"
              />{" "}
              {state.clicks}
            </div>
            <div className="circle-container" onClick={handleCircleClick}>
              <div className="circle"></div>
            </div>
          </div>
        ) : (
          <Leaderboard />
        )}
        <div className="navigation">
          <button
            className={`navigation__btn home-btn ${
              currentPage === "clicker" ? "active" : ""
            }`}
            onClick={() => setCurrentPage("clicker")}
          >
            <img
              src={
                currentPage === "clicker"
                  ? "/img/icon-home-blue.svg"
                  : "/img/icon-home-gray.svg"
              }
              alt="icon-home"
            />
            <span>Главная</span>
          </button>

          <button
            className={`navigation__btn rating-btn ${
              currentPage === "leaderboard" ? "active" : ""
            }`}
            onClick={() => setCurrentPage("leaderboard")}
          >
            <img
              src={
                currentPage === "leaderboard"
                  ? "/img/icon-rating-blue.svg"
                  : "/img/icon-rating-gray.svg"
              }
              alt="icon-rating"
            />
            <span>Рейтинг</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
