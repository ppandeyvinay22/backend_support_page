from flask import Flask, render_template, request, jsonify
import datetime
import psycopg2
from psycopg2 import pool
import time
from datetime import datetime
import random
import json
import ssl
from flask_cors import CORS, cross_origin
from datetime import timedelta
import numpy as np

# import jsonpickle


app = Flask(__name__)
CORS(app)

conn = psycopg2.pool.SimpleConnectionPool(
    1,
    40,
    user="postgres",
    password="0420",
    host="localhost",
    port="5430",
    database="nebulaa_dev_db",
)
if conn:
    print("Connection to database successfully")

try:
    ps_connection = conn.getconn()
    if ps_connection:
        cur = ps_connection.cursor()

        ############ Code for showing the tabels
        s = ""
        s += "SELECT"
        s += " table_schema"
        s += ", table_name"
        s += " FROM information_schema.tables"
        s += " WHERE"
        s += " ("
        s += " table_schema = 'public'"
        s += " )"
        s += " ORDER BY table_schema, table_name;"

        print(s)

        cur.execute(s)
        list_tables = cur.fetchall()

        for t_name_table in list_tables:
            print(t_name_table)
            print("\n")

        cur.close()
    conn.putconn(ps_connection)


except (Exception, psycopg2.DatabaseError) as error:
    print(error)


@app.route("/create_table", methods=["GET", "POST"])
@cross_origin()
def create_table():
    data = create_support_table_in_db()
    return data


def create_support_table_in_db():
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            cur.execute(
                """CREATE TABLE support (
                    id SERIAL PRIMARY KEY,
                    support_date TEXT,
                    issue_type TEXT,
                    support_mode TEXT,
                    error_detail TEXT,
                    support_state TEXT,
                    support_priority TEXT,
                    support_commitment_days INTEGER,
                    resolution_detail TEXT,
                    resolution_date TEXT,
                    resolved_by TEXT,
                    cusotmer_id INTEGER,
                    component_detail TEXT,
                    machine_id INTEGER,
                    support_remark TEXT,
                    generated_by TEXT,
                    visit_required BOOLEAN,
                    visit_required_date TEXT,
                    visit_end_date TEXT,
                    assign_task TEXT,
                    expense INTEGER,
                    h1_replace TEXT,
                    h2_replace TEXT,
                    h3_replace TEXT,
                    h4_replace TEXT,
                    new_machine_no TEXT
                    )"""
            )

            ps_connection.commit()
            print("table created successfully.................")
            cur.close()

        conn.putconn(ps_connection)
        return jsonify({"message": "Table created successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


@app.route("/create_tracking_table", methods=["GET", "POST"])
@cross_origin()
def create_tracking_table():
    data = create_tracking_table_in_db()
    return data


def create_tracking_table_in_db():
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            cur.execute(
                """
                CREATE TABLE tracking_table (
                    id SERIAL PRIMARY KEY,
                    assigned_task TEXT,
                    support_state TEXT,
                    support_date TEXT,
                    resolution_date TEXT,
                    support_remark TEXT,
                    issue_type TEXT,
                    support_id INT REFERENCES support(id)
                );  
            """
            )

            ps_connection.commit()
            print("table created successfully.................")
            cur.close()

        conn.putconn(ps_connection)
        return jsonify({"message": "Table created successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


@app.route("/create_attachment_table", methods=["GET", "POST"])
@cross_origin()
def create_attachment_table():
    data = create_attachment_table_in_db()
    return data


def create_attachment_table_in_db():
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            cur.execute(
                """
                CREATE TABLE attachment (
                    id SERIAL PRIMARY KEY,
                    filename TEXT,
                    filetype TEXT,
                    data BYTEA,
                    support_id INT REFERENCES support(id)
                );  
            """
            )

            ps_connection.commit()
            print("table created successfully.................")
            cur.close()

        conn.putconn(ps_connection)
        return jsonify({"message": "Table created successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# creating new table for machine and customer detail storage
@app.route("/create_machine_customer_info_table", methods=["GET", "POST"])
@cross_origin()
def create_attachmecreate_machine_customer_info_tablent_table():
    data = create_machine_customer_info_table_in_db()
    return data


def create_machine_customer_info_table_in_db():
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            cur.execute(
                """
                CREATE TABLE machine_customer_info (
                    id SERIAL PRIMARY KEY,
                    machine_id INT REFERENCES machine(id),
                    customer_id INT REFERENCES customer(id),
                    support_id INT REFERENCES support(id)
                ); 
            """
            )

            ps_connection.commit()
            print("table created successfully.................")
            cur.close()

        conn.putconn(ps_connection)
        return jsonify({"message": "Table created successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


if __name__ == "__main__":
    app.run(debug=True, port=4800)
