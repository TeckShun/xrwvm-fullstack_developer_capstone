import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");  // Error state for UI display

  let curr_url = window.location.href;
  let root_url = curr_url.substring(0, curr_url.indexOf("postreview"));
  let params = useParams();
  let id = params.id;
  let dealer_url = root_url + `djangoapp/dealer/${id}`;
  let review_url = root_url + `djangoapp/add_review`;
  let carmodels_url = root_url + `djangoapp/get_cars`;

  const postreview = async () => {
    let name = `${sessionStorage.getItem("firstname") || ""} ${sessionStorage.getItem("lastname") || ""}`.trim();
    if (!name) {
      name = sessionStorage.getItem("username") || "Anonymous";
    }

    // Validate inputs
    if (!model || !review || !date || !year || parseInt(year) < 2015 || parseInt(year) > 2023) {
      setErrorMessage("All fields are mandatory. Please check your inputs.");
      return;
    }

    // Split car make and model
    const model_split = model.split(" ");
    const make_chosen = model_split[0];
    const model_chosen = model_split[1];

    // Prepare the review data
    const jsoninput = JSON.stringify({
      name,
      dealership: id,
      review,
      purchase: true,
      purchase_date: date,
      car_make: make_chosen,
      car_model: model_chosen,
      car_year: year,
    });

    try {
      const res = await fetch(review_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsoninput,
      });

      const json = await res.json();

      // Handle response and check for errors
      if (res.ok && json.status === 200) {
        alert("Review posted successfully!");
        window.location.href = `${window.location.origin}/dealer/${id}`;
      } else {
        // Show error message if backend provides one
        setErrorMessage(json.message || "Failed to post review. Please try again.");
      }
    } catch (error) {
      console.error("Error posting review:", error);
      setErrorMessage("An error occurred while submitting your review. Please try again.");
    }
  };

  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url, { method: "GET" });
      const retobj = await res.json();

      if (retobj.status === 200 && retobj.dealer) {
        setDealer(retobj.dealer);
      }
    } catch (error) {
      console.error("Error fetching dealer info:", error);
    }
  };

  const get_cars = async () => {
    try {
      const res = await fetch(carmodels_url, { method: "GET" });
      const retobj = await res.json();

      if (retobj.CarModels) {
        setCarmodels(retobj.CarModels);
      }
    } catch (error) {
      console.error("Error fetching car models:", error);
    }
  };

  useEffect(() => {
    get_dealer();
    get_cars();
  }, []);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>
          {dealer?.full_name || "Loading Dealer Info..."}
        </h1>
        <textarea
          id="review"
          cols="50"
          rows="7"
          placeholder="Write your review here..."
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <div className="input_field">
          Purchase Date{" "}
          <input type="date" onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="input_field">
          Car Make{" "}
          <select name="cars" id="cars" onChange={(e) => setModel(e.target.value)}>
            <option value="" selected disabled hidden>
              Choose Car Make and Model
            </option>
            {carmodels.map((carmodel, index) => (
              <option key={index} value={`${carmodel.CarMake} ${carmodel.CarModel}`}>
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>
        </div>
        <div className="input_field">
          Car Year{" "}
          <input
            type="number"
            onChange={(e) => setYear(e.target.value)}
            max={2023}
            min={2015}
          />
        </div>
        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>} {/* Display error */}
        <div>
          <button className="postreview" onClick={postreview}>
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;
