import { Nav } from "~/components";
import { CVcard } from "~/components";
import type { Route } from "./+types/home";
import { resumes } from '/constants';

import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from "~/lib/puter";


export default function Home() {

    const { auth } = usePuterStore();

    const navigate = useNavigate();

    useEffect( () => {

        if(!auth.isAuthenticated ) {

            navigate('/auth?next=/')

        }

    }, [auth.isAuthenticated])

    console.log(auth.isAuthenticated)






  return (

    <>


      <main className="bg-[url('/images/bg-main.svg')] bg-cover">

        <Nav />

        {/* {window.puter.ai.chat()} */}



        <section className="main-section">

          <div className="page-heading py-16">

            <h1>Track You;r Applications & Resume Ratings.</h1>
            <h2>Review your submissions and check AI-powered feedback.</h2>


          </div>


          {resumes.length > 0 && (

            <div className="resumes-section">

                {resumes.map((res:any) => (

                  <CVcard key={res.id} resume={res} />

                ))}

            </div>  


          )}


        </section>




        </main>
    </>
  );
}


