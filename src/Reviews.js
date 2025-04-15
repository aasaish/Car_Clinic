// ReviewsCarousel.js
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const reviews = [
    {
        name: "Saif Ullah Khan",
        date: "2025-03-13",
        rating: 5,
        review: "The mechanics were professional, quick to respond, and handled my car perfectly.",
    },
    {
        name: "Hina Lohanch",
        date: "2025-02-26",
        rating: 4,
        review: "The services they provided on time appreciated and quality experience they delivered.",
    },
    {
        name: "Munawar Shah",
        date: "2025-04-14",
        rating: 5,
        review: "Loved the convenience and transparency, booking and service were smooth and quick",
    },
    {
        name: "Shameen Anwar",
        date: "2025-02-23",
        rating: 5,
        review: "Reliable and honest service center, my car got fixed without unnecessary delays.",
    },
    {
        name: "Malik Rashid",
        date: "2025-02-25",
        rating: 5,
        review: "Fast diagnostics and excellent repairs, my car now runs smoother than before.",
    },
    {
        name: "Shahan Aslam",
        date: "2025-02-15",
        rating: 5,
        review: "Affordable service with timely updates, totally impressed by their skilled technicians.",
    },
];

export default function ReviewsCarousel() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 992, // tablets
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 768, // mobile
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Hear It From Our Customers</h2>
            <Slider {...settings}>
                {reviews.map((rev, i) => (
                    <div key={i} className="px-3">
                        <div className="card shadow-sm p-3">
                            <div className="d-flex align-items-center mb-2">
                                <span className="text-warning me-2">
                                    {"★".repeat(rev.rating)}
                                </span>
                            </div>
                            <p className="mb-3">{rev.review}</p>
                            <div className="d-flex align-items-center">
                                <div>
                                    <strong>{rev.name}</strong>
                                    <br />
                                    <small className="text-muted">{rev.date}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
