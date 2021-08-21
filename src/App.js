import React, { useState, useEffect, useReducer } from "react";
import blankAvatar from "./blank-profile.png";
import { FaInstagram, FaBirthdayCake } from "react-icons/fa";

const url =
  "https://sparta-backend.herokuapp.com/api/users?jurusan&nim&name&kelompok";
const itemsPerPage = 30;

function toTitleCase(str) {
  return str.replace(/([^\W_]+[^\s/]*) */g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const Image = ({ picture, namaPanggilan }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
  }, [picture]);
  return (
    <div className="card-avatar">
      <img
        src={loaded ? picture || blankAvatar : blankAvatar}
        alt={namaPanggilan}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const reducer = (state, action) => {
  if (action.type === "SHOW_MODAL") {
    const {
      namaPanggilan,
      namaLengkap,
      jurusan,
      nim,
      tanggalLahir,
      instagram,
      picture,
    } = action.payload;
    return {
      ...state,
      showModal: true,
      namaPanggilan,
      namaLengkap,
      jurusan,
      nim,
      tanggalLahir,
      instagram,
      picture,
    };
  }
  if (action.type === "CLOSE_MODAL") {
    return {
      ...state,
      showModal: false,
    };
  }
  return state;
};

const initialState = {
  showModal: false,
  namaPanggilan: "",
  namaLengkap: "",
  jurusan: "",
  nim: "",
  tanggalLahir: "",
  instagram: "",
  picture: "",
};

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [shownData, setShownData] = useState([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = async () => {
    const response = await fetch(url);
    let newData = await response.json();
    newData = newData.filter(
      (person) => !person.namaLengkap.startsWith("Tester")
    );

    setData(newData);

    const pages = Math.ceil(newData.length / itemsPerPage);
    newData = Array.from({ length: pages }, (_, idx) => {
      const start = idx * itemsPerPage;
      return newData.slice(start, start + itemsPerPage);
    });

    setShownData(newData);
    setLoading(false);
  };

  const changePage = (page) => {
    setPage(page);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(0);

    let newData = data.filter((person) => {
      return (
        person.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
        person.namaPanggilan.toLowerCase().includes(search.toLowerCase())
      );
    });

    const pages = Math.ceil(newData.length / itemsPerPage);
    newData = Array.from({ length: pages }, (_, idx) => {
      const start = idx * itemsPerPage;
      return newData.slice(start, start + itemsPerPage);
    });

    setShownData(newData);
  }, [search, data]);

  return (
    <main>
      <div className="container">
        <div className="header">
          <h3>Introducing</h3>
          <h1>Init - HMIF'20</h1>
          {loading && <h3 className="loading">Loading...</h3>}
        </div>
        {!loading && (
          <>
            <form className="input">
              <input
                type="text"
                className="search-field"
                placeholder="Masukkan nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            {!shownData.length > 0 && (
              <h3 className="loading">Data tidak ditemukan.</h3>
            )}
            {shownData.length > 0 && (
              <>
                <div className="cards-container">
                  {shownData[page].map((person) => {
                    const {
                      id,
                      namaPanggilan,
                      namaLengkap,
                      jurusan,
                      nim,
                      tanggalLahir,
                      instagram,
                      picture,
                    } = person;
                    return (
                      <div
                        className="card"
                        key={id}
                        onClick={() =>
                          dispatch({
                            type: "SHOW_MODAL",
                            payload: {
                              namaPanggilan,
                              namaLengkap,
                              jurusan,
                              nim,
                              tanggalLahir,
                              instagram,
                              picture: picture || blankAvatar,
                            },
                          })
                        }
                      >
                        <Image
                          picture={picture}
                          namaPanggilan={namaPanggilan}
                        />
                        {/* <div className="card-avatar">
                          <img src={picture || blankAvatar} alt={namaPanggilan} />
                        </div> */}
                        <h3 className="card-info">
                          {toTitleCase(namaPanggilan)}
                        </h3>
                        <h3 className="card-info">{jurusan}</h3>
                      </div>
                    );
                  })}
                </div>
                <div className="btn-container">
                  {shownData.map((_, idx) => {
                    return (
                      <button
                        key={idx}
                        className={`btn ${idx === page ? "btn-active" : null}`}
                        onClick={() => changePage(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className={`modal-overlay ${state.showModal ? "show" : null}`}>
        <div className="modal-container">
          <div className="modal-left">
            <h1>{toTitleCase(state.namaPanggilan)}</h1>
            <div className="underline"></div>
            <div className="modal-subinfo">
              <p>{toTitleCase(state.namaLengkap)}</p>
              <p>
                {state.jurusan} - {state.nim}
              </p>
            </div>
            <div className="birthday">
              <FaBirthdayCake />
              <p>{state.tanggalLahir.slice(0, 10)}</p>
            </div>
            <a
              href={`https://www.instagram.com/${state.instagram}`}
              className="instagram"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram />
            </a>
            <div className="modal-btn">
              <button onClick={() => dispatch({ type: "CLOSE_MODAL" })}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-right">
            {state.showModal && (
              <img src={state.picture} alt={state.namaPanggilan} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
