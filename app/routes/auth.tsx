import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from "~/lib/puter";


const auth = () => {

    const { isLoading, auth } = usePuterStore();

    const location = useLocation()
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();

    useEffect( () => {

        if( auth.isAuthenticated ) {

            navigate(next)

        }

    }, [auth.isAuthenticated, next])


  return (

    <main className="bg-[url('/images/bg-main.svg')] bg-cover flex justify-center items-center">

        <div className="gradient-border shadow-lg">

            <section className="flex flex-col gap=8 bg-white rounded-2xl p-10">

                <div className=" flex flex-col items-center gap-2 text-center m-5 ">

                    <h1>Welcome</h1>
                    <h2>Log in to contune You'r Job Journey</h2>

                </div>

                <div className="">

                    {
                        isLoading ? 
                         (<button className='auth-button animate-pulse'>

                            <p className=''>Signing you in...</p>

                         </button>)
                        : (
                            <>
                                {
                                    auth.isAuthenticated ? (

                                        <button className='auth-button' onClick={auth.signOut}>
                                            <p> Log Out </p>
                                        </button>
                                        
                                    ) : (

                                        <button className='auth-button' onClick={auth.signIn}>
                                            <p> Log In </p>
                                        </button>

                                    )

                                }
                            </>
                        )

                    }

                </div>

            </section>

        </div>

    </main>

  )
}

export default auth

