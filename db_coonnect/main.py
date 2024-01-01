from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin
import datetime
import psycopg2
import requests
from psycopg2 import pool
import time
from datetime import datetime
import random
import json
import ssl
from datetime import timedelta
import numpy as np

# import jsonpickle


app = Flask(__name__)
# CORS(app)

conn = psycopg2.pool.SimpleConnectionPool(
    1,
    40,
    user="postgres",
    password="Vinay@121",
    host="localhost",
    port="5432",
    database="neodb_development",
)


@app.route("/save_machine_and_customer_details", methods=["GET", "POST"])
@cross_origin()
def save_machine_and_customer_details():
    content = request.get_json(force=True)
    # print("******", content)
    data = db_save_machine_and_customer_details(content)
    return jsonify(data)


def db_save_machine_and_customer_details(json_obj):
    # l = []
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            print("****************", json_obj)
            cur = ps_connection.cursor()

            # query to save support_date and id in support table
            query_save_date_and_id = """
            INSERT INTO SUPPORT
                (support_date)
            VALUES
                (%s)RETURNING id
        """
            cur.execute(query_save_date_and_id, (json_obj["support_date"],))
            # cur.execute(query_save_machine_and_customer_details, (1, 1))
            ps_connection.commit()

            # Fetch the support_id
            inserted_id = cur.fetchone()[0]
            print("new_ticket_id_generated----------->", inserted_id)

            # # query_to_get_machine_and_custome_id
            # query_to_get_machine_and_custome_id = """
            #     SELECT id, customer_id FROM machine where code = %s
            # """

            # # created a temporary list to store the value of machine_no and customer_id of respective machine_no chosen
            # machine_customer_list = []

            # if "machines" in json_obj:
            #     # Iterate over the list of machines
            #     for machine_data in json_obj["machines"]:
            #         machine_no = machine_data["machine_no"]
            #         cur.execute(query_to_get_machine_and_custome_id, (machine_no,))

            #         records = cur.fetchall()
            #         records[0] = list(records[0])
            #         records[0].append(inserted_id)
            #         machine_customer_list.append(records[0])
            #         # print("------------", records)
            #         # print("------------", machine_customer_list)

            # **** trial query to optimize the code
            # Query to get machine_id and customer_id based on machine_no
            query_to_get_machine_and_customer_id = """
                SELECT id, customer_id FROM machine WHERE code = %s
            """

            # Create a list to store machine and customer information
            machine_customer_list = []

            if "machines" in json_obj:
                # List to store machine_no values for the query execution
                machine_nos = [
                    machine_data["machine_no"] for machine_data in json_obj["machines"]
                ]
                print("machine_nos..........", machine_nos)

                # Execute the query to fetch machine_id and customer_id for all machine_no values
                cur.execute(
                    query_to_get_machine_and_customer_id,
                    tuple(machine_nos),
                )
                records = cur.fetchall()

                # Iterate over the fetched records and append them to the machine_customer_list
                for record in records:
                    machine_customer_list.append(list(record) + [inserted_id])

            # Print or use machine_customer_list as needed
            # print(machine_customer_list)

            print("------------", machine_customer_list)

            # Now, this query is to insert the respective machine_id, customer_id, support_id in machine_customer_info table
            query_to_insert_machine_customer_info = """
                INSERT INTO machine_customer_info
                (machine_id, customer_id, support_id)
                VALUES
                    (%s, %s, %s)
            """
            # for row in machine_customer_list:
            #     # print(row)
            #     cur.execute(
            #         query_to_insert_machine_customer_info, (row[0], row[1], row[2])
            #     )
            ps_connection.commit()

            # json_obj["id"] = inserted_id
            cur.close()

        # conn.putconn(ps_connection)
        return machine_customer_list

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        status_code = getattr(error, "status_code", 500)
        error_message = {
            "status_code": status_code,
            "message": "An error occurred",
            "error_details": str(error),
        }
        return error_message
    finally:
        # Close the cursor and connection in the finally block
        if "cur" in locals() and cur is not None:
            cur.close()
        if "ps_connection" in locals() and ps_connection is not None:
            conn.putconn(ps_connection)


# 9th route to handle employee's name detail


# @app.route("/")
# def home():
#     get_individual_card_data = requests.get(
#         "http://127.0.0.1:5443/individual_card_data", json={"id": "85"}
#     )
#     data = get_individual_card_data.json()
#     print(data)
#     return render_template("index.html", data=data)


if __name__ == "__main__":
    app.run(debug=True, port=5445)
