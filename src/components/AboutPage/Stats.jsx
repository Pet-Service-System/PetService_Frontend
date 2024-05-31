import React from 'react';

export const Stats = () => {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-40 py-60">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="stats-grid text-center">
            <div className="stats-img">
              <i className="fa fa-users text-5xl" aria-hidden="true"></i>
            </div>
            <h5 className="text-4xl font-semibold mt-4">Happy Clients</h5>
            <div className='numscroller numscroller-big-bottom text-3xl mt-2' data-slno='1' data-min='0' data-max='157000' data-delay='.5' data-increment="100">157000</div>
          </div>
          <div className="stats-grid text-center">
            <div className="stats-img">
              <i className="fa fa-calendar-check-o text-5xl" aria-hidden="true"></i>
            </div>
            <h5 className="text-4xl font-semibold mt-4">Our Events</h5>
            <div className='numscroller numscroller-big-bottom text-3xl mt-2' data-slno='1' data-min='0' data-max='850' data-delay='8' data-increment="1">850</div>
          </div>
          <div className="stats-grid text-center">
            <div className="stats-img">
              <i className="fa fa-briefcase text-5xl" aria-hidden="true"></i>
            </div>
            <h5 className="text-4xl font-semibold mt-4">Projects</h5>
            <div className='numscroller numscroller-big-bottom text-3xl mt-2' data-slno='1' data-min='0' data-max='80000' data-delay='.5' data-increment="100">80000</div>
          </div>
          <div className="stats-grid text-center">
            <div className="stats-img">
              <i className="fa fa-trophy text-5xl" aria-hidden="true"></i>
            </div>
            <h5 className="text-4xl font-semibold mt-4">Awards</h5>
            <div className='numscroller numscroller-big-bottom text-3xl mt-2' data-slno='1' data-min='0' data-max='269' data-delay='8' data-increment="1">269</div>
          </div>
        </div>
      </div>
    </div>
  );
};
