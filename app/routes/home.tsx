import { Nav } from "~/components";
import { ResumeCard } from "~/components";
import type { Route } from "./+types/home";
import React, { use, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router';
import { usePuterStore } from "~/lib/puter";


export default function Home() {

    const { auth, kv } = usePuterStore();

    const navigate = useNavigate();

    const [ resumes, setResumes ] = useState<Resume[]>([]);
    const [ loadingResumes , setloadingResumes] = useState(false);

    const [ resumeUrl, setResumeUrl ] = useState('')

    useEffect( () => {

        if(!auth.isAuthenticated ) {

            navigate('/auth?next=/')

        }

    }, [auth.isAuthenticated])

    useEffect( () => {

      const loadResumes = async () => {
        
        setloadingResumes(true)

        const resumes = (await kv.list('resume:*', true )) as KVItem[];

        const parsedResumes = resumes?.map(( resume ) => (

          JSON.parse(resume.value) as Resume

        ))

        console.log(parsedResumes)

        setResumes( parsedResumes || [])

        setloadingResumes(false)

      }

      loadResumes()


    }, [])






  return (

    <>


      <main className="bg-[url('/images/bg-main.svg')] bg-cover">

        <Nav />

        <section className="main-section">

          <div className="page-heading py-16">

            <h1>Track You;r Applications & Resume Ratings.</h1>

            {

              !loadingResumes && resumes.length === 0 ? (

                <h2>No Resumes found upload You'r first Resume to get feedBack.</h2>

              ) : (

                <h2>Review your submissions and check AI-powered feedback.</h2>

              )

            }

          </div>

          { 
            
              loadingResumes && (

                <div className="flex flex-col items-center justify-center">

                  <img src="/images/resume-scan-2.gif" alt="" className="w-[200px]"/>

                </div>

              )

          }

          {
          
            !loadingResumes &&  resumes.length > 0 && (

              <div className="resumes-section">

                  {resumes.map((res:any) => (

                    <ResumeCard key={res.id} resume={res} />

                  ))}

              </div>  

            ) 
          }

          {

            !loadingResumes && resumes.length > 0 && (

              <div className="flex items-center justify-center flex-col mt-10 gap-4">

                <Link to="/upload" className="primary-button w-fit text-xl font-semibold"> Upload Resume </Link>

              </div>

            )


          }


        </section>

      </main>

    </>
  );
}


