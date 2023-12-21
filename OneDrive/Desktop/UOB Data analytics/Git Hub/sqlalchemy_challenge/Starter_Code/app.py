# Import the dependencies.
from flask import Flask, jsonify
import numpy as np
import datetime as dt
from sqlalchemy import create_engine, func
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///Resources/hawaii.sqlite")


# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)


# Save references to each table
Measurement = Base.classes.measurement
Station = Base.classes.station


# Create our session (link) from Python to the DB
session = Session(engine)


#################################################
# Flask Setup
#################################################
app = Flask(__name__)




#################################################
# Flask Routes
#################################################
@app.route("/")
def welcome():
    return (
        f"Welcome to the Climate Analysis API!<br/>"
        f"Available Routes:<br/>"
        f"/api/v1.0/precipitation<br/>"
        f"/api/v1.0/stations<br/>"
        f"/api/v1.0/tobs<br/>"
        f"/api/v1.0/start_date (format: YYYY-MM-DD)<br/>"
        f"/api/v1.0/start_date/end_date (format: YYYY-MM-DD)"
    )

# Define the precipitation route
@app.route("/api/v1.0/precipitation")
def precipitation():
    # Calculate the date one year from the last date in the data set
    one_year_ago = dt.date(2017, 8, 23) - dt.timedelta(days=365)
    
    # Perform a query to retrieve the data and precipitation scores
    results = session.query(Measurement.date, Measurement.prcp).filter(Measurement.date >= one_year_ago).all()

    # Convert the query results to a dictionary
    precipitation_data = {date: prcp for date, prcp in results}

    return jsonify(precipitation_data)

# Define the stations route
@app.route("/api/v1.0/stations")
def stations():
    # Query all stations
    results = session.query(Station.station, Station.name).all()

    # Convert the query results to a list of dictionaries
    stations_data = [{"station": station, "name": name} for station, name in results]

    return jsonify(stations_data)

# Define the temperature observations route
@app.route("/api/v1.0/tobs")
def tobs():
    # Calculate the date one year from the last date in the data set
    one_year_ago = dt.date(2017, 8, 23) - dt.timedelta(days=365)
    
    # Query the dates and temperature observations of the most active station for the previous year of data
    results = session.query(Measurement.date, Measurement.tobs).\
        filter(Measurement.date >= one_year_ago).\
        filter(Measurement.station == 'USC00519281').all()

    # Convert the query results to a list of dictionaries
    tobs_data = [{"date": date, "tobs": tobs} for date, tobs in results]

    return jsonify(tobs_data)

# Define the start route
@app.route("/api/v1.0/<start>")
def start(start):
    # Calculate the minimum, average, and maximum temperatures from the given start date to the end of the dataset
    results = session.query(func.min(Measurement.tobs), func.avg(Measurement.tobs), func.max(Measurement.tobs)).\
        filter(Measurement.date >= start).all()

    # Convert the query results to a list of dictionaries
    temperature_data = [{"Min Temperature": result[0], "Avg Temperature": result[1], "Max Temperature": result[2]} for result in results]

    return jsonify(temperature_data)

# Define the start/end route
@app.route("/api/v1.0/<start>/<end>")
def start_end(start, end):
    # Calculate the minimum, average, and maximum temperatures from the given start date to the given end date
    results = session.query(func.min(Measurement.tobs), func.avg(Measurement.tobs), func.max(Measurement.tobs)).\
        filter(Measurement.date >= start).\
        filter(Measurement.date <= end).all()

    # Convert the query results to a list of dictionaries
    temperature_data = [{"Min Temperature": result[0], "Avg Temperature": result[1], "Max Temperature": result[2]} for result in results]

    return jsonify(temperature_data)

if __name__ == "__main__":
    app.run(debug=True)