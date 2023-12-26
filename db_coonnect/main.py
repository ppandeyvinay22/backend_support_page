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
    user="nebulaa",
    password="nebulaa1234",
    host="164.52.211.223",
    port="5432",
    database="neodb_development",
)


# 1st route to fetch software/hardware/datateam data
@app.route("/hardware_data", methods=["GET", "POST"])
@cross_origin(allow_headers=["Content-Type"])
def get_hardware_data():
    content = request.get_json(force=True)
    # print(content)
    data = get_hardware_data_from_db(content)
    return jsonify(data)


def get_hardware_data_from_db(json_obj):
    msg = None
    support_list = []
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            # print(json_obj['issue_type'])
            cur = ps_connection.cursor()
            query_start_time = time.time()
            get_all_data_query = """  
                SELECT  id, support_date, Issue_type,  error_detail, support_state, support_priority, assign_task, machine_id  FROM Support where Issue_type = %s ORDER BY id DESC;
            """
            cur.execute(get_all_data_query, [json_obj["Issue_type"]])

            records = cur.fetchall()
            # print("records here printed:- " ,records[0], records[1])
            for i in range(len(records)):
                records[i] = list(records[i])
                machine_id = records[i][7]
                cur2 = ps_connection.cursor()
                get_machine_data_query = """
                    SELECT code FROM Machine WHERE id = %s
                """
                cur2.execute(get_machine_data_query, [machine_id])
                machine_records = cur2.fetchall()
                # print(machine_records)

                # removed the machine_id from the records[i] list bcz it was not required in the frontend
                records[i].pop()
                # addded the machine number from machine id as the last elemnt of the list before appending it to support_list
                records[i] += [machine_records[0][0]]
                support_list.append(records[i])

            cur.close()

        conn.putconn(ps_connection)
        return support_list

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 2nd route to fetch all data of any Issue_type
@app.route("/all_data", methods=["GET", "POST"])
@cross_origin(allow_headers=["Content-Type"])
def get_all_data():
    data = get_all_data_from_db()
    return jsonify(data)


def get_all_data_from_db():
    msg = None
    support_list = []
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            # print(json_obj['support_state'])
            cur = ps_connection.cursor()
            query_start_time = time.time()
            get_all_data_query = """  
                SELECT id, support_date, Issue_type,  error_detail, support_state, support_priority, assign_task, machine_id FROM Support ORDER BY id DESC;
            """
            cur.execute(get_all_data_query)

            records = cur.fetchall()
            # print("records here printed:- " ,records[0], records[1])
            for i in range(len(records)):
                records[i] = list(records[i])
                machine_id = records[i][7]
                cur2 = ps_connection.cursor()
                get_machine_data_query = """
                    SELECT code FROM Machine WHERE id = %s
                """
                cur2.execute(get_machine_data_query, [machine_id])
                machine_records = cur2.fetchall()

                records[
                    i
                ].pop()  # removed the machine_id from the records[i] list bcz it was not required in the frontend
                records[i] += [
                    machine_records[0][0]
                ]  # addded the machine number from machine id as the last elemnt of the list before appending it to support_list
                support_list.append(records[i])

            cur.close()

        conn.putconn(ps_connection)
        return support_list

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 3rd route to fetch the data for a particular card
@app.route("/individual_card_data", methods=["GET"])
@cross_origin(allow_headers=["Content-Type"])
def get_individual_card_data():
    content = request.get_json(force=True)
    # print(content)
    data = get_individual_card_data_from_db(content)
    # print("------",data,type( data))
    return jsonify(data)


def get_individual_card_data_from_db(json_obj):
    msg = None
    support_list = []
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            get_all_data_query = """  
                SELECT id, support_date, generated_by, support_mode, support_priority, support_commitment_days, issue_type, support_state, assign_task, support_remark, error_detail, resolved_by, resolution_detail, resolution_date, visit_required, visit_start_date, visit_end_date, expense, h1_replace, h2_replace, h3_replace, h4_replace, cusotmer_id FROM Support where id = %s ;
            """
            cur.execute(get_all_data_query, [json_obj["id"]])
            records = cur.fetchall()
            # print(records[0])

            records[0] = list(records[0])
            customer_id = records[0][22]
            cur2 = ps_connection.cursor()
            get_machine_data_query = """
                SELECT head_instituition, instituition_name, instituition_code FROM CUSTOMER WHERE id = %s
            """
            cur2.execute(get_machine_data_query, [customer_id])
            machine_records = cur2.fetchall()
            records[0].pop()
            records[0] += [machine_records[0][0]]
            records[0] += [machine_records[0][1]]
            records[0] += [machine_records[0][2]]
            support_list.append(records[0])

            cur.close()

        conn.putconn(ps_connection)
        print(support_list)
        return support_list

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 4th route to add a ticket
@app.route("/save_raised_ticket", methods=["POST"])
@cross_origin(allow_headers=["Content-Type"])
def save_raised_ticket():
    content = request.get_json(force=True)
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            # this query is to get machine_id and cusotmer_id from support_id taht will be provided as json data
            get_customer_and_machine_id_query = """
            SELECT machine_id, cusotmer_id  from SUPPORT
            WHERE id = %s
            """
            cur.execute(get_customer_and_machine_id_query, [content["id"]])
            results = cur.fetchall()
            print(results)

            # this query is to save the data in support table
            save_raised_ticket_query1 = """  
            UPDATE SUPPORT
            SET
                assign_task = %s,
                support_date = %s,
                support_state = %s,
                issue_type = %s,
                generated_by = %s,
                machine_id = %s,
                cusotmer_id = %s,
                support_priority = %s,
                support_commitment_days = %s,
                error_detail = %s
            WHERE id = %s;
            """

            cur.execute(
                save_raised_ticket_query1,
                (
                    "naveen",
                    "13-09-2023",
                    "pending",
                    "hardware",
                    "ashish panwar",
                    results[0][0],
                    results[0][1],
                    "high",
                    "3",
                    "so many errors",
                    (content["id"]),
                ),
            )
            ps_connection.commit()

            # this query is to save the data in tracking_table table
            save_raised_ticket_query2 = """
            INSERT INTO tracking_table
            ( support_state, support_date, Issue_type, support_id)
            VALUES
                (  %s, %s, %s, %s )
"""
            cur.execute(
                save_raised_ticket_query2,
                ("pending", "12-09-2023", "datateam", (content["id"])),
            )
            ps_connection.commit()

            cur.close()

        conn.putconn(ps_connection)
        return jsonify({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 5th route to edit a ticket
@app.route("/save_edit_card_details", methods=["POST"])
@cross_origin(allow_headers=["Content-Type"])
def save_edit_card_details():
    content = request.get_json(force=True)
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            # these informations I got from the form, so I will only update them
            assign_task = "vinay"
            support_priority = "high"
            support_commitment_days = "3"
            issue_type = "hardware"
            support_date = "25-08-2023"
            support_remark = "Finally done"
            support_state = "resolved"
            support_mode = "online"

            # this query is to update the edit card details in support table
            save_raised_ticket_query1 = """
            UPDATE SUPPORT
            SET
                assign_task = %s,
                support_priority = %s,
                support_commitment_days = %s,
                Issue_type = %s,
                support_remark = %s,
                support_state = %s,
                support_mode = %s
            WHERE id = %s;
        """

            cur.execute(
                save_raised_ticket_query1,
                (
                    assign_task,
                    support_priority,
                    support_commitment_days,
                    issue_type,
                    support_remark,
                    support_state,
                    support_mode,
                    content["support_id"],
                ),
            )
            ps_connection.commit()

            # this query is to get the latest table for the specific support_id from trcking table
            get_last_data_query = """
            SELECT id, assign_task, support_state, support_remark, issue_type
            FROM tracking_table
                WHERE support_id = %s
                AND support_date = (
                SELECT MAX(support_date)
                FROM tracking_table
            WHERE support_id = %s
            );
        """
            cur.execute(
                get_last_data_query, (content["support_id"], content["support_id"])
            )
            records = cur.fetchall()
            print(records[0])

            if (
                assign_task != records[0][1]
                or issue_type != records[0][4]
                or (
                    support_state != records[0][2]
                    and (
                        support_state == "inprogress"
                        or support_state == "internet_issue"
                    )
                )
            ):
                # this query is to update the data in the last row of tracking_table
                update_edited_ticket_query = """
                UPDATE TRACKING_TABLE
                SET
                    resolution_date = %s,
                    support_remark = %s
                WHERE id = %s;
            """
                cur.execute(
                    update_edited_ticket_query,
                    (support_date, support_remark, records[0][0]),
                )
                ps_connection.commit()

                # Simultaneously we would be adding a new row in the table
                add_new_row_query = """
                INSERT INTO TRACKING_TABLE
                (assign_task, support_state, support_date, Issue_type, support_id)
                VALUES
                    (%s, %s, %s, %s, %s )
            """
                cur.execute(
                    add_new_row_query,
                    (
                        assign_task,
                        support_state,
                        support_date,
                        issue_type,
                        content["support_id"],
                    ),
                )
                ps_connection.commit()

            elif support_state != records[0][2] and support_state == "resolved":
                # this query is to update the data in the last row of tracking_table and make it's state 'resolved' and give it a resolution date with a remark
                update_edited_ticket_query = """
                UPDATE TRACKING_TABLE
                SET
                    support_state = %s,
                    resolution_date = %s,
                    support_remark = %s
                WHERE id = %s;
            """
                cur.execute(
                    update_edited_ticket_query,
                    (support_state, support_date, support_remark, records[0][0]),
                )
                ps_connection.commit()

            cur.close()

        conn.putconn(ps_connection)
        return jsonify({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 6th route to get the Head_Institute's name
@app.route("/get_customer_cities_head_institution_wise", methods=["POST"])
@cross_origin(allow_headers=["Content-Type"])
def get_customer_cities_head_institution_wise():
    data = db_get_customer_cities_head_institution_wise()
    return jsonify(data)


def db_get_customer_cities_head_institution_wise():
    msg = None
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()
            # query_start_time = time.time()

            # this query is written to fetch the head_institute data
            postgreSQL_select_Query = "select head_instituition from Customer"
            cur.execute(postgreSQL_select_Query)
            records = cur.fetchall()

            records = np.unique(records)
            print(records)

            # column  = []
            results = {}

            for record in records:
                # print (record)
                if record:
                    # column.append(record)
                    # print(record)
                    postgreSQL_select_Query = "select id, instituition_name, state, instituition_code from Customer where head_instituition = %s "
                    cur.execute(postgreSQL_select_Query, (str(record),))
                    re = cur.fetchall()

                    # Remove leading and trailing spaces from each element in the result
                    # re = [(str(id).strip(), str(name).strip(), str(state).strip(), str(code).strip()) for id, name, state, code in re]

                    l = []
                    for r in re:
                        id_dict = {}
                        id_dict.update({"id": r[0]})
                        id_dict.update({"city": r[1]})
                        id_dict.update({"state": r[2]})
                        id_dict.update({"machine_no": r[3]})
                        l.append(id_dict)

                    # re = list(np.unique(re))
                    record = record.strip()
                    results.update({record: l})

            # print(results)
            return results

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        msg = "Unable to Store the Customer due to Some technical glitches"
        return False, msg


# 7th route when somenone clicks on the next before raise ticket modal opening
@app.route("/save_machine_and_customer_details", methods=["GET", "POST"])
@cross_origin(allow_headers=["Content-Type"])
def save_machine_and_customer_details():
    content = request.get_json(force=True)
    data = db_save_machine_and_customer_details(content)
    return jsonify(data)


def db_save_machine_and_customer_details(json_obj):
    l = []
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            query_to_get_machine_and_custome_id = """
            SELECT id, customer_id FROM machine where code = %s 
        """
            cur.execute(query_to_get_machine_and_custome_id, [json_obj["machine_no"]])
            records = cur.fetchall()
            print("------------", records)

            query_save_machine_and_customer_details = """
            INSERT INTO SUPPORT
            (machine_id, cusotmer_id)
            VALUES
                (%s, %s)RETURNING id
        """
            cur.execute(
                query_save_machine_and_customer_details, (records[0][0], records[0][1])
            )
            ps_connection.commit()

            # Fetch the support_id
            inserted_id = cur.fetchone()[0]
            print("inbhg ghjk h----------->", inserted_id)

            l.append(inserted_id)
            l.append(json_obj["head_institution"])
            l.append(json_obj["institution_name"])
            l.append(json_obj["machine_no"])

            cur.close

        conn.putconn(ps_connection)
        return l

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 8th route for deleting things(card deletion and deletion of machine_id and customer_id from suppport table)
@app.route("/deleting_card_information", methods=["GET", "POST"])
@cross_origin(allow_headers=["Content-Type"])
def deleting_card_information():
    content = request.get_json(force=True)
    data = db_deleting_card_information(content)
    return jsonify(data)


def db_deleting_card_information(json_obj):
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            checking_query = """
            select count(*) FROM tracking_table 
            WHERE support_id = %s
        """
            cur.execute(checking_query, [json_obj["support_id"]])
            records = cur.fetchall()
            count_support_id = records[0][0]
            print("count -----", records[0][0])

            if count_support_id > 0:
                query_to_delete_card_information2 = """
                DELETE FROM tracking_table
                WHERE support_id = %s;
            """
                cur.execute(query_to_delete_card_information2, [json_obj["support_id"]])
                ps_connection.commit()

            query_to_delete_card_information1 = """
            DELETE FROM support
            WHERE id = %s;
        """
            cur.execute(query_to_delete_card_information1, [json_obj["support_id"]])
            ps_connection.commit()

            cur.close()

        conn.putconn(ps_connection)
        return ({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 9th route to handle employee's name detail


@app.route("/")
def home():
    get_individual_card_data = requests.get(
        "http://127.0.0.1:5443/individual_card_data", json={"id": "85"}
    )
    data = get_individual_card_data.json()
    print(data)
    return render_template("index.html", data=data)


if __name__ == "__main__":
    app.run(debug=True, port=5443)
