"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

gsap.registerPlugin(DrawSVGPlugin, Physics2DPlugin);

const LoadArt = () => {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const ctx = gsap.context(() => {
            const particles = gsap.utils.toArray<SVGPolygonElement>(
                ".particleContainer polygon"
            );
            const ripples = gsap.utils.toArray<SVGEllipseElement>(
                ".rippleGroup > *"
            );
            const rippleTargets = [
                { rx: 220, ry: 38 },
                { rx: 200, ry: 35 },
                { rx: 180, ry: 30 },
            ];

            gsap.set(".reflection", {
                scaleY: -1,
                transformOrigin: "50% 100%",
                autoAlpha: 0.1,
            });

            const randomBetween = (min: number, max: number) =>
                Math.floor(Math.random() * (max - min + 1) + min);

            const doSplash = () => {
                gsap.set(particles, {
                    x: 0,
                    y: 0,
                    scale: () => randomBetween(6, 18) / 10,
                });

                particles.forEach((p) => {
                    gsap.to(p, {
                        duration: randomBetween(3, 9) / 10,
                        physics2D: {
                            velocity: randomBetween(200, 600),
                            angle: randomBetween(-120, -20),
                            gravity: 800,
                        },
                        scale: 0,
                    });
                });
            };

            const doRipple = () => {
                ripples.forEach((el, i) => {
                    gsap.fromTo(
                        el,
                        { attr: { rx: 0, ry: 0 }, autoAlpha: 0.6 },
                        {
                            duration: 1,
                            attr: rippleTargets[i],
                            autoAlpha: 0,
                        }
                    );
                });
            };

            const onRepeat = () => {
                doSplash();
                doRipple();
            };

            const archesTl = gsap.timeline({
                repeat: -1,
                onStart: onRepeat,
                onRepeat,
            });

            archesTl
                .to(".arch1", { duration: 1, drawSVG: "100% 100%", ease: "expo.out" })
                .from(
                    ".arch2",
                    { duration: 1, drawSVG: "0% 0%", ease: "expo.in" },
                    "-=1"
                )
                .to(".archGroup", { duration: 0.5, x: -125, ease: "sine.out" }, 0)
                .to(".archGroup", { duration: 0.5, x: -250, ease: "sine.in" }, 0.5)
                .to(".rippleGroup", { duration: 1, x: -250, ease: "sine.inOut" }, 0);
        }, root);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={rootRef}
            className="auth-dashboard-preview absolute top-0 w-full h-full"
        >
            <svg
                viewBox="0 0 800 600"
                className="w-full h-full"
                style={{ background: "black" }}
            >
                <defs>
                    <g className="archGroup" id="archGroup">
                        <path
                            className="arch1"
                            d="M265,349a125,125,0,0,1,250,0"
                            fill="none"
                            stroke="#FB4F1F"
                            strokeMiterlimit={10}
                            strokeWidth={51}
                        />
                        <path
                            className="arch2"
                            d="M515,349a125,125,0,0,1,250,0"
                            fill="none"
                            stroke="#FB4F1F"
                            strokeMiterlimit={10}
                            strokeWidth={51}
                        />
                    </g>
                </defs>

                <use xlinkHref="#archGroup" />
                <use className="reflection" xlinkHref="#archGroup" />

                <g
                    className="rippleGroup"
                    fill="none"
                    stroke="#FB4F1F"
                    strokeMiterlimit={10}
                >
                    <ellipse cx={515} cy={345} rx={57.5} ry={8.5} />
                    <ellipse cx={515} cy={345} rx={79.5} ry={14.5} />
                    <ellipse cx={515} cy={345} rx={109.5} ry={20.5} />
                </g>

                <g className="particleContainer" fill="#FB4F1F">
                    {Array.from({ length: 22 }).map((_, i) => (
                        <polygon
                            key={i}
                            points="515.5 340.73 517.2 344.17 520.99 344.72 518.25 347.39 518.89 351.17 515.5 349.39 512.11 351.17 512.75 347.39 510.01 344.72 513.8 344.17 515.5 340.73"
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default LoadArt;