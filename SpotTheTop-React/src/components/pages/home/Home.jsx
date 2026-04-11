import React from 'react';

export default function Home() {
    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4">Welcome to SpotTheTop</h2>
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-primary text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title">Top Performers</h5>
                            <p className="card-text">View the highest-rated players this week.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-success text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title">Recent Matches</h5>
                            <p className="card-text">Catch up on the latest verified match statistics.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 bg-warning text-dark h-100">
                        <div className="card-body">
                            <h5 className="card-title">Community Feed</h5>
                            <p className="card-text">See what scouts and fans are discussing.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}