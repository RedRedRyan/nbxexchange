"use client"
import React from 'react'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useAppKitAccount} from "@reown/appkit/react";


const Page = () => {

    const { address, isConnected, isConnecting } = useAppKitAccount();
    return (
       <section id={"dash"}>
           <div className={"flex-center flex-col  mb-6"}>
               <Avatar className="h-24 w-24">
                   <AvatarImage src="https://github.com/shadcn.png" />
                   <AvatarFallback className="bg-orange text-black text-sm font-bold">
                       {address}
                   </AvatarFallback>
               </Avatar>
               <h1 className={"mt-5"}>{address}</h1>
               <h1>profile</h1>
           </div>

           <div className="dash-grid">
               <div className="bg-orange h-40 lg:h-64">Hello</div>
               <div className="bg-blue-500 h-40 lg:h-64">World</div>
               <div className="bg-green-500 h-40 lg:h-64">!</div>
               <div className="bg-green-500 h-40 lg:h-64">!</div>
           </div>
       </section>
    )
}
export default Page
