import React from "react";
import Header from "@/components/Header";
import Link from "next/link";
import Image from "next/image";
import CarMove from "@/components/CarMove";
import LoadArt from "@/components/LoadArt";


const layout = ({ children }: { children: React.ReactNode }) => {
  return (
      <main className="auth-layout">
        <section className="auth-left-section scrollbar-hide-default">
          <Link href="/" className="auth-logo">
            <Image
                src="/assets/icons/headerlogo.png"
                alt="Signalist logo"
                width={32}
                height={32}
                className="h-8 w-auto"
            />
          </Link>
          <div className="pb-6 lg:pb-8 flex-1">{children}</div>
        </section>
        <section className="auth-right-section">
          <div className="z-10 relative lg:mt-4 lg:mb-16 ">
            <blockquote className="auth-blockquote">
              One account, endless opportunities
            </blockquote>
            <div className="flex items-center justify-between">
              <div>
                <cite className="auth-testimonial-author">Ethan  Rese</cite>
                <p className="max-md:text-xs text-black">Retail Investor</p>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Image
                        src="/assets/icons/star.svg"
                        alt="Star"
                        key={star}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                    />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <h1 className={"py-10 px-10 absolute text-orange text-3xl z-10"}>Access <br/> Your <br/> Account </h1>
        <LoadArt/>
          </div>
        </section>
      </main>
  );
};

export default layout;
