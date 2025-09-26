import React, { useState, type FormEvent } from "react";

import { useNavigate, type FormEncType } from "react-router";

import { Nav } from "~/components";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import {generateUUID} from "~/lib/utils";
import {convertPdfToImage} from "~/lib/pdf2img";
import { prepareInstructions } from "constants";



const Upload = () => {


    const { auth, isLoading, fs, ai, kv } = usePuterStore();

    const navgate = useNavigate();

    const [ isPro, setIsPro ] = useState(false)
    const [ statusText, setStatusText ] = useState('')
    const [ file, setFile ] = useState<File | null>(null)

    const handelFileSelect = (file: File | null) => {

        setFile(file)

    }

    const handelAnalizy = async ({ companyName, jobTitle, jobDescrabtion, file } : { companyName: string, jobTitle: string, jobDescrabtion: string, file: File}) => {


        setIsPro(true);
        setStatusText('Uploading the file...')

        const uploadedFile = await fs.upload([file])

        console.log(uploadedFile)

        if(!uploadedFile) return setStatusText('Error: Failed to upload file...')

        setStatusText('Converting to Image...')

        const imageFile = await convertPdfToImage(file)

        if(!imageFile.file) return setStatusText('Failed to Convert PDF to Image')

        setStatusText('Uploading Image')

        const uploadImage = await fs.upload([imageFile.file])

        if(!uploadImage) return setStatusText('Error: Failed to upload image...')

        setStatusText('Perparing date...');

        const uuid = generateUUID()

        const data = {

            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadImage.path,
            companyName: companyName,
            jobTitle: jobTitle,
            jobDescrabtion: jobDescrabtion,
            feedback: '',

        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data))
        setStatusText('Analyzing')

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescrabtion })
        )

        if(!feedback) return setStatusText('Error: Failed to analyze resume')

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        
        data.feedback = JSON.parse( feedbackText );        
             
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, rediracting...')

        console.log(data)

        navgate(`/resume/${uuid}`)



    }


    const handelSubmit = (e: FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        const form = e.currentTarget.closest('form')
         
        if(!form) return;

        const formData = new FormData(form);


        const companyName = formData.get('company-name') as string
        const jobTitle = formData.get('job-title') as string
        const jobDescrabtion = formData.get('job-descraption') as string

        if(!file) return;

        handelAnalizy({ companyName, jobTitle, jobDescrabtion, file })

    }

  return (

    <main className="bg-[url('/images/bg-main.svg')] bg-cover">

        <Nav />


        <section className="main-section">

            <div className="page-heading py-16">

                <h1>Smart feedback for you'r dream Job.</h1>

                {
                    isPro ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" alt=""  className="w-full"/>
                        </>
                    ) : (

                        <h2>Drop You'r Resume for an ATS Score and Improvment tips.</h2>

                    )
                }

                {
                    !isPro && (

                        <form className="flex flex-col gap-4 mt-8" id="upload-form" onSubmit={handelSubmit} action="">

                            <div className="form-div">

                                <label htmlFor="company-name" className="">Company Name</label>

                                <input type="text" name="company-name" placeholder="Company Name" id="company-name"/>

                            </div>

                            <div className="form-div">

                                <label htmlFor="job-title" className="">Job Title</label>

                                <input type="text" name="job-title" placeholder="Job Title" id="job-title"/>

                            </div>

                            <div className="form-div">

                                <label htmlFor="job-descraption" className="">Job descraption</label>

                                <textarea rows={5} name="job-descraption" placeholder="Job descraption" id="job-descraption"/>

                            </div>

                            <div className="form-div">

                                <label htmlFor="uploader" className="">Upload Resume</label>

                                <FileUploader onFileSelect={handelFileSelect}/>

                            </div>

                            <button className="primary-button" type="submit">
                                Analizy Resume
                            </button>

                        </form>

                    ) 
                }

            </div>

        </section>

    </main>
    
  )
}

export default Upload;