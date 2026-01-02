import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import front from "../Images/front.png"
import programmingData from "../data/data.json"; // Import JSON
import "../pages/Home.css";


function Home() {
  return (
    <>
      <div className="Home">
        <Navbar />
        <img src={front} alt="JavaScript concepts" className="image" />
        {/* <br></br> <br></br> */}
        <h1 className="heading">Javascript programming examples, exercises and solutions for beginners</h1>
        <div className="cards-container" id="learning-paths">
          {programmingData.cards.map((card, index) => (
            <Card
              key={index}
              heading={card.heading}
              links={card.links}
            />  
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}

export default Home;