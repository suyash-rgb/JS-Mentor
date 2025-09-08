import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home"; 
import Fundamentals from "../pages/Fundamentals";
import Bitwise from '../pages/bitwise';
import Ternary from '../pages/ternary';
import Sixth from '../pages/techtrends';
import Switchjs from '../pages/switch';
import Fivth from '../pages/loop';
import Fundamentals2 from '../pages/12';
import Fundamentals3 from '../pages/13';
import Fundamentals4 from '../pages/14';
import Fundamentals5 from '../pages/15';
import Fundamentals6 from '../pages/16';
import Fundamentals7 from '../pages/17';
import Fundamentals8 from '../pages/18';
import Fundamentals9 from '../pages/19';
import Fundamentals10 from '../pages/110';
import Bitwise2 from '../pages/22';
import Bitwise3 from '../pages/23';
import Bitwise4 from '../pages/24';
import Bitwise5 from '../pages/25';
import Bitwise6 from '../pages/26';
import Bitwise7 from '../pages/27';
import Bitwise8 from '../pages/28';
import Bitwise9 from '../pages/29';
import Bitwise10 from '../pages/210';
import Ternary2 from '../pages/32';
import Ternary3 from '../pages/33';
import Ternary4 from '../pages/34';
import Ternary5 from '../pages/35';
import Ternary6 from '../pages/36';
import Ternary7 from '../pages/37';
import Ternary8 from '../pages/38';
import Ternary9 from '../pages/39';
import Ternary10 from '../pages/310';
import Switchjs2 from '../pages/42';
import Switchjs3 from '../pages/43';
import Switchjs4 from '../pages/44';
import Switchjs5 from '../pages/45';
import Switchjs6 from '../pages/46';
import Switchjs7 from '../pages/47';
import Switchjs8 from '../pages/48';
import Switchjs9 from '../pages/49';
import Switchjs10 from '../pages/410';
import Fivth2 from '../pages/52';
import Fivth3 from '../pages/53';
import Fivth4 from '../pages/54';
import Fivth5 from '../pages/55';
import Fivth6 from '../pages/56';
import Fivth7 from '../pages/57';
import Fivth8 from '../pages/58';
import Fivth9 from '../pages/59';
import Fivth10 from '../pages/510';
import Sixth2 from '../pages/62';
import Sixth3 from '../pages/63';
import Sixth4 from '../pages/64';
import Sixth5 from '../pages/65';
import Sixth6 from '../pages/66';
import Sixth7 from '../pages/67';
import Sixth8 from '../pages/68';
import Sixth9 from '../pages/69';
import Sixth10 from '../pages/610';
import JSCompiler from '../pages/jscompiler';
import Ai from '../pages/Ai';
function AppRouter() {



    return (

        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jscompiler" element={<JSCompiler />} />
                <Route path="/Ai" element={<Ai />} />
                <Route path="/js" element={<Fundamentals />} />
                <Route path="/jsb" element={<Fundamentals2 />} />
                <Route path="/sue" element={<Fundamentals3 />} />
                <Route path="/gs" element={<Fundamentals4 />} />
                <Route path="/vc" element={<Fundamentals5 />} />
                <Route path="/oe" element={<Fundamentals6 />} />
                <Route path="/cf" element={<Fundamentals7 />} />
                <Route path="/fc" element={<Fundamentals8 />} />
                <Route path="/ao" element={<Fundamentals9 />} />
                <Route path="/ehd" element={<Fundamentals10 />} />


                <Route path="/cc" element={<Bitwise />} />
                <Route path="/pa" element={<Bitwise2 />} />
                <Route path="/eh" element={<Bitwise3 />} />
                <Route path="/dom" element={<Bitwise4 />} />
                <Route path="/mdj" element={<Bitwise5 />} />
                <Route path="/afa" element={<Bitwise6 />} />
                <Route path="/jds" element={<Bitwise7 />} />
                <Route path="/ef" element={<Bitwise8 />} />
                <Route path="/mmb" element={<Bitwise9 />} />
                <Route path="/paa" element={<Bitwise10 />} />


                <Route path="/ff" element={<Ternary />} />
                <Route path="/rb" element={<Ternary2 />} />
                <Route path="/rrn" element={<Ternary3 />} />
                <Route path="/smr" element={<Ternary4 />} />
                <Route path="/sr" element={<Ternary5 />} />
                <Route path="/hfui" element={<Ternary6 />} />
                <Route path="/lmr" element={<Ternary7 />} />
                <Route path="/iav" element={<Ternary8 />} />
                <Route path="/spa" element={<Ternary9 />} />
                <Route path="/tfc" element={<Ternary10 />} />

                <Route path="/in" element={<Switchjs />} />
                <Route path="/nmn" element={<Switchjs2 />} />
                <Route path="/rae" element={<Switchjs3 />} />
                <Route path="/di" element={<Switchjs4 />} />
                <Route path="/aa" element={<Switchjs5 />} />
                <Route path="/me" element={<Switchjs6 />} />
                <Route path="/ehn" element={<Switchjs7 />} />
                <Route path="/rtc" element={<Switchjs8 />} />
                <Route path="/tbc" element={<Switchjs9 />} />
                <Route path="/dh" element={<Switchjs10 />} />

                <Route path="/ifb" element={<Fivth />} />
                <Route path="/a" element={<Fivth2 />} />
                <Route path="/sm" element={<Fivth3 />} />
                <Route path="/op" element={<Fivth4 />} />
                <Route path="/sbp" element={<Fivth5 />} />
                <Route path="/id" element={<Fivth6 />} />
                <Route path="/bsa" element={<Fivth7 />} />
                <Route path="/ma" element={<Fivth8 />} />
                <Route path="/gb" element={<Fivth9 />} />
                <Route path="/agac" element={<Fivth10 />} />


                <Route path="/pwa" element={<Sixth />} />
                <Route path="/wj" element={<Sixth2 />} />
                <Route path="/sa" element={<Sixth3 />} />
                <Route path="/ml" element={<Sixth4 />} />
                <Route path="/wc" element={<Sixth5 />} />
                <Route path="/rtc2" element={<Sixth6 />} />
                <Route path="/cbc" element={<Sixth7 />} />
                <Route path="/po" element={<Sixth8 />} />
                <Route path="/wd" element={<Sixth9 />} />
                <Route path="/jtt" element={<Sixth10 />} />


            </Routes>
        </Router>


    );
}

export default AppRouter;