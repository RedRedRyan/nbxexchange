"use client"

import React, {useEffect} from 'react'
import Header from '@/components/Header'
import {useAppKitAccount} from "@reown/appkit/react";
import {router} from "next/client";
import {redirect, useRouter} from "next/navigation";


const layout = ({children}:{children : React.ReactNode}) => {


  const { isConnected  } = useAppKitAccount();



  return (
<main className='min-h-screen text-gray-400'>
    <Header/>
    <div className='container py-10'>
        {children}
    </div>

</main>
  )
}

export default layout