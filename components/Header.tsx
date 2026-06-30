import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavItems from './NavItems'
import UserDropdown from './UserDropdown'

const Header = () => {
  return (
    <header className='sticky top-0 header'>
        <div className='container header-wrapper'>
            <Link href="/" className={"flex flex-row flex-center gap-2"}>
            <Image src= "/assets/icons/headerlogo.png" alt='NBX Logo' width={140} height={32} className='h-8 w-auto cursor-pointer' />
                <h1 className={"text-2xl text-orange font-bold "}>NBX</h1>
            </Link>
            <nav className='hidden sm:block'>
                <NavItems/>
            </nav>
            <UserDropdown/>
        </div>
    </header>
  )
}

export default Header