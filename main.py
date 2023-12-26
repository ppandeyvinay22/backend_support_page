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
import base64
from datetime import timedelta
from werkzeug.utils import secure_filename
import numpy as np

# import jsonpickle


app = Flask(__name__)
CORS(app)

# conn = psycopg2.pool.SimpleConnectionPool(
#     1,
#     40,
#     user="nebulaa",
#     password="nebulaa1234",
#     host="164.52.211.223",
#     port="5432",
#     database="neodb_development",
# )

# conn = psycopg2.pool.SimpleConnectionPool(
#     1,
#     40,
#     user="postgres",
#     password="0420",
#     host="localhost",
#     port="5430",
#     database="nebulaa_dev_db",
# )
conn = psycopg2.pool.SimpleConnectionPool(
    1,
    40,
    user="postgres",
    password="vinay121",
    host="localhost",
    port="5432",
    database="neodb_development",
)


# **********Nebulaa support API's to fetch data from db**************


# 1st route to fetch software/hardware/datateam data
@app.route("/specific_issue_data", methods=["GET", "POST"])
@cross_origin()
def get_specific_issue_data():
    content = request.get_json(force=True)
    # print(content)
    data = get_specific_issue_data_from_db(content)
    return jsonify(data)

def get_specific_issue_data_from_db(json_obj):
    msg = None
    support_list = []
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            # print(json_obj['issue_type'])
            cur = ps_connection.cursor()
            get_all_data_query = """ 
                SELECT 
                s.id, 
                s.support_date, 
                s.Issue_type, 
                s.error_detail, 
                s.support_state, 
                s.support_priority, 
                s.assign_task,
                s.generated_by,
                s.support_mode,
                s.resolved_by,
                m.code
                FROM 
                Support s
                INNER JOIN 
                Machine m ON s.machine_id = m.id
                WHERE 
                s.Issue_type = %s
                ORDER BY 
                s.id DESC; 
            """
            cur.execute(get_all_data_query, [json_obj["Issue_type"]])
            records = cur.fetchall()
            cur.close()

        conn.putconn(ps_connection)
        return records

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 2nd route to fetch all data of any Issue_type
@app.route("/all_data", methods=["GET", "POST"])
@cross_origin()
def get_all_data():
    data = get_all_data_from_db()
    return jsonify(data)


def get_all_data_from_db():
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            # print(json_obj['support_state'])
            cur = ps_connection.cursor()
            query_start_time = time.time()
            get_all_data_query = """ 
            SELECT 
            s.id, 
            s.support_date, 
            s.Issue_type, 
            s.error_detail, 
            s.support_state, 
            s.support_priority, 
            s.assign_task,
            s.generated_by,
            s.support_mode,
            s.resolved_by,
            m.code
            FROM 
            Support s
            INNER JOIN 
            Machine m ON s.machine_id = m.id
            ORDER BY 
            s.id DESC; 
            """
            # support mode, "Raised by whome" , "machinestatus"
            cur.execute(get_all_data_query)

            records = cur.fetchall()
            print("records here printed:- ", records[0], records[1])

            cur.close()

        conn.putconn(ps_connection)
        return records

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 3rd route to fetch the data for a particular card
@app.route("/individual_card_data", methods=["GET", "POST"])
@cross_origin()
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
                SELECT 
    s.id, 
    s.support_date, 
    s.generated_by, 
    s.support_mode, 
    s.support_priority, 
    s.support_commitment_days, 
    s.issue_type, 
    s.support_state, 
    s.assign_task, 
    s.support_remark, 
    s.error_detail, 
    s.resolved_by, 
    s.resolution_detail, 
    s.resolution_date, 
    s.visit_required, 
    s.visit_start_date, 
    s.visit_end_date, 
    s.expense, 
    s.h1_replace, 
    s.h2_replace, 
    s.h3_replace, 
    s.h4_replace, 
    c.head_instituition, 
    c.instituition_name, 
    c.instituition_code
FROM 
    Support s
INNER JOIN 
    Customer c ON s.cusotmer_id = c.id
WHERE 
    s.id = %s;
            """
            cur.execute(get_all_data_query, [json_obj["id"]])
            records = cur.fetchall()
            # print(records[0])
            cur.close()

        conn.putconn(ps_connection)
        return records

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 4th route to add a ticket


@app.route("/save_raised_ticket", methods=["POST"])
@cross_origin(allow_headers=["Content-Type", "multipart/form-data"])
def save_raised_ticket():
    # content = {
    #     "commitmentDays": "5",
    #     "errorDetails": "test-06",
    #     "generatedBy": "Ashish",
    #     "head_institution": "ENAM Rajasthan",
    #     "institution_name": "Bhagat ki kothi",
    #     "issueType": "Software",
    #     "machine_no": "1016",
    #     "priority": "Medium",
    #     "support_date": "2023-12-19T12:33:21.101Z",
    #     "support_id": 212,
    #     "support_state": "pending",
    #     "support_mode": "online"
    #     }
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
            cur.execute(get_customer_and_machine_id_query, [content["support_id"]])
            results = cur.fetchall()
            print(results)

            # this query is to save the data in support table
            save_raised_ticket_query1 = """  
            UPDATE SUPPORT
            SET
                support_date = %s,
                support_state = %s,
                issue_type = %s,
                generated_by = %s,
                support_priority = %s,
                support_commitment_days = %s,
                error_detail = %s,
                support_mode = %s
            WHERE id = %s;
            """

            cur.execute(
                save_raised_ticket_query1,
                (
                    content["support_date"],
                    content["support_state"],
                    content["issueType"],
                    content["generatedBy"],
                    content["priority"],
                    content["commitmentDays"],
                    content["errorDetails"],
                    content["support_mode"],
                    (content["support_id"]),
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
                (
                    content["support_state"],
                    content["support_date"],
                    content["issueType"],
                    (content["support_id"]),
                ),
            )
            ps_connection.commit()

            cur.close()

        conn.putconn(ps_connection)
        return jsonify({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 4.1 route to upload images,pdf using support id


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {
        "pdf",
        "png",
        "jpg",
        "jpeg",
    }


@app.route("/upload_files", methods=["POST"])
@cross_origin(allow_headers=["Content-Type", "multipart/form-data"])
def upload():
    content = request.form.get("support_id")
    print(content)
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            if "files" in request.files:
                files = request.files.getlist("files")
                print(content, files)
                save_raised_ticket_attachments_query2 = """
                    INSERT INTO attachment
                    ( filename, filetype, data, support_id)
                    VALUES
                        (  %s, %s, %s, %s )"""
                for file in files:
                    if file and allowed_file(file.filename):
                        filename = secure_filename(file.filename)
                        file_type = filename.split(".")[-1]
                        file_data = file.read()
                        # print(filename, file_type,content, type(content))
                        cur.execute(
                            save_raised_ticket_attachments_query2,
                            (filename, file_type, file_data, (content)),
                        )
            ps_connection.commit()
        conn.putconn(ps_connection)
        return jsonify({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 4.2 view specific images and pdf related to specific attachment
@app.route("/view/<int:file_id>", methods=["GET"])
@cross_origin(allow_headers=["Content-Type", "multipart/form-data"])
def view_file(file_id):
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()
            get_all_attachemnts = """
        SELECT * from attachment where id = %s
        """
            cur.execute(get_all_attachemnts, [file_id])
            files = cur.fetchall()
            print(files)
            if files:
                # if file.filetype.lower() == 'pdf':
                #     file.data = base64.b64encode(file.data).decode('utf-8')
                #     return render_template('view_pdf.html', file=file)
                # else:
                #     file.data = base64.b64encode(file.data).decode('utf-8')
                #     return render_template('view_image.html', file=file)
                # Convert memoryview objects to bytes before jsonify
                files_json = [
                    {
                        "id": file[0],
                        "filename": file[1],
                        "filetype": file[2],
                        "data": base64.b64encode(file[3]).decode("utf-8"),
                    }
                    for file in files
                ]

                return jsonify({"files": files_json})

            else:
                return "File not found"
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        # Return an error response
        return jsonify({"error": str(error), "files": []})

# to view at front-end

@app.route('/view_attachment_image/<int:file_id>')
def view_attachment_image(file_id):
    # url = 'http://127.0.0.1:5559/view/'+str(file_id)
    url = 'http://127.0.0.1:5443/view/'+str(file_id)
    # print("url", url)
    file = requests.get(url).json()
    file = file['files'][0]
    # return render_template('view_attachments_image.html',file = file['files'][0] , title = 'View Image Analytics')
    # print(file)

    if file:
        if file["filetype"].lower() == 'pdf':
            # file["data"] = base64.b64encode(file["data"].encode('utf-8')).decode('utf-8')
            # print(file)
            # print(type (file["data"]))
            return render_template('view_attachments_pdf.html', file=file)
        else:
            # file["data"] = base64.b64encode(file["data"].encode('utf-8')).decode('utf-8')
            # print(type (file["data"]))
            return render_template('view_attachments_image.html', file=file)
    else:
        return 'File not found' 

# 4.3 view specific images and pdf related to specific suopport_uid
@app.route("/view", methods=["POST"])
@cross_origin(allow_headers=["Content-Type"])
def view_file_with_specific_support_id():
    try:
        ps_connection = conn.getconn()
        content = request.get_json(force=True)
        print("content -->", content)
        if ps_connection:
            cur = ps_connection.cursor()
            get_all_attachemnts = """
        SELECT id,filename,filetype from attachment where support_id = %s
        """
            cur.execute(get_all_attachemnts, [content["support_id"]])
            files = cur.fetchall()
            # print(files)
            if files:
                # if file.filetype.lower() == 'pdf':
                #     file.data = base64.b64encode(file.data).decode('utf-8')
                #     return render_template('view_pdf.html', file=file)
                # else:
                #     file.data = base64.b64encode(file.data).decode('utf-8')
                #     return render_template('view_image.html', file=file)
                # Convert memoryview objects to bytes before jsonify
                files_json = [
                    {"id": file[0], "filename": file[1], "filetype": file[2]}
                    for file in files
                ]

                return jsonify({"files": files_json})

            else:
                return "File not found"
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        # Return an error response
        return jsonify({"error": str(error), "files": []})


# 4.4 view all the images and pdf related to specific support id
@app.route("/view/all", methods=["GET"])
@cross_origin(allow_headers=["Content-Type", "multipart/form-data"])
def view_all_file():
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()
            # support mode, "Raised by whome" , "machinestatus"
            get_all_attachemnts = """
SELECT * from attachment order by id ASC
"""
            cur.execute(get_all_attachemnts)
            files = cur.fetchall()
            print(files)
            cur.close()

        conn.putconn(ps_connection)

        # Convert memoryview objects to bytes before jsonify
        files_json = [
            {
                "id": file[0],
                "filename": file[1],
                "filetype": file[2],
                "data": base64.b64encode(file[3]).decode("utf-8"),
            }
            for file in files
        ]

        return jsonify({"files": files_json})

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        # Return an error response
        return jsonify({"error": str(error), "files": []})


# 4.5 delete specific image and pdf using id
@app.route("/delete_attachments", methods=["POST"])
@cross_origin()
def delete_attachments():
    content = request.get_json(force=True)
    data = delete_attachments_from_db(content)
    return jsonify(data)


def delete_attachments_from_db(json_obj):
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            # query to delete the individual attacments
            delete_individual_attachments = """
            DELETE FROM attachment
            WHERE id = %s
        """
            cur.execute(delete_individual_attachments, (json_obj["attachment_id"]))
            ps_connection.commit()
            cur.close()

        conn.putconn(ps_connection)
        return ({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 4.5 delete specific image and pdf using


@app.route("/delete_attachment/<int:attachment_id>", methods=["GET"])
@cross_origin()
def delete_attachment(attachment_id):
    # content = request.get_json(force=True)
    data = delete_attachments_from_db(attachment_id)
    print(attachment_id, type(attachment_id))
    return jsonify(data)


def delete_attachments_from_db(a_id):
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            # query to delete the individual attacments
            delete_individual_attachments = """
            DELETE FROM attachment
            WHERE id = %s
        """
            cur.execute(delete_individual_attachments, ([a_id]))
            ps_connection.commit()
            cur.close()

        conn.putconn(ps_connection)
        return ({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 4.5 delete individual image and pdf using
# @app.route("/delete_individual_attachments", methods = ["POST"])
# @cross_origin()
# def delete_individual_attachments():
#     content = request.get_json(force=True)
#     data = delete_individual_attachments_from_db(content)
#     return jsonify(data)


# def delete_individual_attachments_from_db(json_obj):
#     try:
#         ps_connection = conn.getconn()
#         if ps_connection:
#             cur = ps_connection.cursor()

#             # query to delete the individual attacments
#             delete_individual_attachments = """
#             DELETE FROM attachment
#             WHERE filename = %s and support_id = %s
#         """
#             cur.execute(
#                 delete_individual_attachments,
#                 (json_obj["filename"], json_obj["support_id"]),
#             )
#             ps_connection.commit()
#             cur.close()

#         conn.putconn(ps_connection)
#         return ({"message": "Ticket saved successfully"}), 200

#     except (Exception, psycopg2.DatabaseError) as error:
#         print(error)
#         return False


# 5th route to edit a ticket


@app.route("/save_edit_card_details", methods=["POST"])
@cross_origin()
def save_edit_card_details():
    content = request.get_json(force=True)
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            # these informations I got from the form, so I will only update them
            # assign_task = "vinay"
            # support_priority = "high"
            # support_commitment_days = "3"
            # issue_type = "hardware"
            # support_date = "25-08-2023"
            # support_remark = "Finally done"
            # support_state = "resolved"
            # support_mode = "online"

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
                    content["assign_task"],
                    content["priority"],
                    content["commitmentDays"],
                    content["issueType"],
                    content["supportRemarks"],
                    content["support_state"],
                    content["support_mode"],
                    content["support_id"],
                ),
            )
            ps_connection.commit()


            # this query is to get the latest table for the specific support_id from trcking table
            get_new_row_add_data_query = """
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
                get_new_row_add_data_query, (content["support_id"], content["support_id"])
            )
            records = cur.fetchall()
            print("------> size of ",records)

            if not records:
                print("Query result is empty.")

                # if there are no previous tracking record, add a new row here this time
                add_new_row_query = """
                        INSERT INTO TRACKING_TABLE
                        (assign_task, support_state, support_date, Issue_type, support_id)
                        VALUES
                            (%s, %s, %s, %s, %s )
                    """
                cur.execute(
                    add_new_row_query,
                    (
                        content["assign_task"],
                        content["support_state"],
                        content["support_date"],
                        content["issueType"],
                        content["support_id"],
                    ),
                )
                ps_connection.commit()

            else:
                print("------**********query result is there")
                if (
                    content["assign_task"] != records[0][1]
                    or content["issueType"] != records[0][4]
                    or (
                        content["support_state"] != records[0][2]
                        and (
                            content["support_state"].lower() == "ongoing"
                            or content["support_state"].lower() == "internetissue"
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
                        (content["support_date"], content["supportRemarks"], records[0][0]),
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
                            content["assign_task"],
                            content["support_state"],
                            content["support_date"],
                            content["issueType"],
                            content["support_id"],
                        ),
                    )
                    ps_connection.commit()

                elif (
                    content["support_state"] != records[0][2]
                    and content["support_state"].lower() == "done"
                ):
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
                        (
                            content["support_state"],
                            content["support_date"],
                            content["supportRemarks"],
                            records[0][0],
                        ),
                    )
                    ps_connection.commit()

            cur.close()

        conn.putconn(ps_connection)
        return jsonify({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 6th route to get the Head_Institute's name
@app.route("/get_customer_cities_head_institution_wise_data", methods=["GET", "POST"])
@cross_origin()
def get_customer_cities_head_institution_wise_data():
    data = db_get_customer_cities_head_institution_wise_data()

    return jsonify(data)


# def db_get_customer_cities_head_institution_wise_data():
#     try:
#         ps_connection = conn.getconn()
#         if ps_connection:
#             cur = ps_connection.cursor()

#             # Use a single query to fetch the required data
#             postgreSQL_select_Query = """
#                 SELECT id, instituition_name, state, instituition_code, head_instituition
#                 FROM Customer
#             """
#             cur.execute(postgreSQL_select_Query)
#             records = cur.fetchall()

#             results = []

#             for record in records:
#                 if record:
#                     # Build a dictionary for each record
#                     id_dict = {
#                         "id": record[0],
#                         "city": record[1],
#                         "state": record[2],
#                         "machine_no": record[3],
#                         "head_institution": record[4]
#                     }

#                     # Append the dictionary to the results list
#                     results.append({id_dict['city']: id_dict})

#             cur.close()
#             conn.putconn(ps_connection)

#             return results

#     except (Exception, psycopg2.DatabaseError) as error:
#         print(error)
#         msg = "Unable to retrieve customer data due to some technical glitches"
#         return False, msg


def db_get_customer_cities_head_institution_wise_data():
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
# checked
@app.route("/save_machine_and_customer_details", methods=["GET", "POST"])
@cross_origin()
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

            #     query_to_get_machine_and_custome_id = """
            #     SELECT id, cusotmer_id FROM machine where code = %s
            # """
            #     cur.execute(query_to_get_machine_and_custome_id, [json_obj["machine_no"]])
            #     records = cur.fetchall()
            #     print("------------", records)

            query_save_machine_and_customer_details = """
            INSERT INTO SUPPORT
            (machine_id, cusotmer_id)
            VALUES
                (%s, %s)RETURNING id
        """
            # cur.execute(
            #     query_save_machine_and_customer_details, (records[0][0], records[0][1])
            # )
            cur.execute(query_save_machine_and_customer_details, (1, 1))
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


# {
#   "head_institution": "FCI",
#   "institution_name": "Sultanabad",
#   "machine_no": "1346"
# }


# 8th route for deleting things(card deletion and deletion of machine_id and cusotmer_id from suppport table)
@app.route("/deleting_card_information", methods=["GET", "POST"])
@cross_origin()
def deleting_card_information():
    content = request.get_json(force=True)
    data = db_deleting_card_information(content)
    return jsonify(data)


def db_deleting_card_information(json_obj):
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            # to check whether data is present data in tracking_table
            checking_query1 = """
            select count(*) FROM tracking_table 
            WHERE support_id = %s
        """
            cur.execute(checking_query1, [json_obj["support_id"]])
            records = cur.fetchall()
            count_support_id_in_tracking_table = records[0][0]
            # print("count -----", records)

            if count_support_id_in_tracking_table > 0:
                query_to_delete_card_information2 = """
                DELETE FROM tracking_table
                WHERE support_id = %s;
            """
                cur.execute(query_to_delete_card_information2, [json_obj["support_id"]])
                ps_connection.commit()

            # to check whether data is present data in attachment table
            checking_query2 = """
            select count(*) FROM attachment 
            WHERE support_id = %s
        """
            cur.execute(checking_query2, [json_obj["support_id"]])
            records = cur.fetchall()
            count_support_id_in_attachment_table = records[0][0]
            print("count2 -----", records)

            if count_support_id_in_attachment_table > 0:
                query_to_delete_card_information2 = """
                DELETE FROM attachment
                WHERE support_id = %s;
            """
                cur.execute(query_to_delete_card_information2, [json_obj["support_id"]])
                ps_connection.commit()

            # query to delete information of card from support table
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


# 9th route to enter employee details
@app.route("/get_employee_details", methods=["GET", "POST"])
@cross_origin()
def get_employee_details():
    data = db_get_employee_details()
    return jsonify(data)


def db_get_employee_details():
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()
            # this query is used to get the distinct department names
            get_employee_details_query = """
        SELECT department, ARRAY_AGG(username) as usernames
        FROM users
        WHERE department IS NOT NULL AND username IS NOT NULL
        GROUP BY department
    """
        cur.execute(get_employee_details_query)
        user_dict = {}
        for record in cur.fetchall():
            department = record[0]
            usernames = record[1]

            # Populate the user_dict dictionary with department names and lists of usernames
            user_dict[department] = usernames
            # print(user_dict)
            cur.close()

        conn.putconn(ps_connection)
        return user_dict

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


# 10th route to delete individual attachment
@app.route("/delete_individual_attachments", methods=["POST"])
@cross_origin()
def delete_individual_attachments():
    content = request.get_json(force=True)
    data = delete_individual_attachments_from_db(content)
    return jsonify(data)


def delete_individual_attachments_from_db(json_obj):
    try:
        ps_connection = conn.getconn()
        if ps_connection:
            cur = ps_connection.cursor()

            # query to delete the individual attacments
            delete_individual_attachments = """
            DELETE FROM attachment
            WHERE filename = %s and support_id = %s
        """
            cur.execute(
                delete_individual_attachments,
                (json_obj["filename"], json_obj["support_id"]),
            )
            ps_connection.commit()
            cur.close()

        conn.putconn(ps_connection)
        return ({"message": "Ticket saved successfully"}), 200

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False


ticket_data = {
    "AMC JANGAON": [
        {
            "city": "AMC JANGAON",
            "id": 235,
            "machine_no": " AMC-J",
            "state": "TELANGANA",
        }
    ],
    "ANANT": [
        {
            "city": "AnantLocation",
            "id": 233,
            "machine_no": "11008",
            "state": "null",
        }
    ],
    "APSCSCL": [
        {
            "city": "hyderabad-office",
            "id": 203,
            "machine_no": "1235",
            "state": "null",
        }
    ],
    "Canada ": [
        {
            "city": "ETG Commodities INC",
            "id": 229,
            "machine_no": "CAN-1",
            "state": "Swift current",
        }
    ],
    "ENAM GUJARAT12": [
        {"city": "8999", "id": 199, "machine_no": "898", "state": "Rajasthan"}
    ],
    "ENAM Haryana": [
        {
            "city": "Adampur",
            "id": 144,
            "machine_no": "1155",
            "state": "Haryana",
        },
        {"city": "Ambala", "id": 145, "machine_no": "1156", "state": "Haryana"},
        {
            "city": "Assandh",
            "id": 146,
            "machine_no": "1157",
            "state": "Haryana",
        },
        {
            "city": "Barwala",
            "id": 147,
            "machine_no": "1158",
            "state": "Haryana",
        },
    ],
    "ENAM Rajasthan": [
        {
            "city": "Mandawri",
            "id": 5,
            "machine_no": "1013",
            "state": "Rajasthan",
        },
        {
            "city": "Mandore Jodhpur",
            "id": 6,
            "machine_no": "1014",
            "state": "Rajasthan",
        },
        {
            "city": "Shahpura",
            "id": 7,
            "machine_no": "1015",
            "state": "Rajasthan",
        },
        {
            "city": "Bhagat ki kothi",
            "id": 8,
            "machine_no": "1016",
            "state": "Rajasthan",
        },
    ],
    "FCI": [
        {
            "city": "RS Miryalaguda",
            "id": 443,
            "machine_no": "1355",
            "state": "Telangana",
        },
        {
            "city": "Sultanabad",
            "id": 444,
            "machine_no": "1346",
            "state": "Telangana",
        },
        {
            "city": "PSWC Bagli- Chawapail",
            "id": 526,
            "machine_no": "1438",
            "state": "Punjab",
        },
        {
            "city": "PSWC Rahon - RSD Khanna",
            "id": 527,
            "machine_no": "1440",
            "state": "Punjab",
        },
    ],
    "FRL-GUJRAT": [
        {
            "city": "Food Research Lab",
            "id": 198,
            "machine_no": "FRL",
            "state": "Gujarat",
        }
    ],
    "GHANA": [{"city": "ACCRA", "id": 221, "machine_no": "G1", "state": "GHANA"}],
    "Gujarat SAMB": [
        {
            "city": "Gujarat SAMB",
            "id": 236,
            "machine_no": "SAMB",
            "state": "gujarat",
        }
    ],
    "Jharkhand": [
        {
            "city": "JSAMB",
            "id": 234,
            "machine_no": "JSAMB-1",
            "state": "Jharkhand",
        }
    ],
    "LIM": [
        {
            "city": "LIMAGRAIN",
            "id": 223,
            "machine_no": "101",
            "state": "TELANGANA",
        }
    ],
    "McCain Foods (India) Pvt Ltd": [
        {
            "city": "McCain Foods (India) Pvt Ltd",
            "id": 230,
            "machine_no": "McCain-1",
            "state": "Gujarat",
        }
    ],
    "NAGA LIMITED": [
        {
            "city": "DINDIGUL",
            "id": 222,
            "machine_no": "11002",
            "state": "TAMIL-NADU",
        }
    ],
    "NBHC": [
        {
            "city": "nbhc1",
            "id": 204,
            "machine_no": "8001",
            "state": "Telangana",
        },
        {"city": "nbhc2", "id": 206, "machine_no": "8002", "state": "null"},
        {"city": "nbhc3", "id": 207, "machine_no": "8003", "state": "null"},
        {"city": "nbhc4", "id": 208, "machine_no": "8004", "state": "null"},
    ],
    "NEBULAA-DELHI": [
        {"city": "NEBULAA", "id": 220, "machine_no": "NEB", "state": "DELHI"}
    ],
    "Nebulaa": [
        {
            "city": "Nebulaa-Hyderabad",
            "id": 141,
            "machine_no": "null",
            "state": "Telangana",
        },
        {
            "city": "Nebulaa-Jaipur",
            "id": 202,
            "machine_no": "NEBJ",
            "state": "RAJASTHAN",
        },
    ],
    "Nebulaa-Jaipur": [
        {
            "city": "Nebulaa-Jaipur",
            "id": 205,
            "machine_no": "NEBJA",
            "state": "Rajasthan",
        }
    ],
    "ORANGE SORTER": [
        {
            "city": "ORANGE SORTER COIMBATOR",
            "id": 232,
            "machine_no": "ORANGE-1",
            "state": "TAMIL-NADU",
        }
    ],
    "TSDOIT": [
        {
            "city": "Nizamabad1",
            "id": 231,
            "machine_no": "1237",
            "state": "null",
        },
        {
            "city": "Mahbubnagar",
            "id": 218,
            "machine_no": "1235",
            "state": "TELANGANA",
        },
        {
            "city": "Nizamabad",
            "id": 219,
            "machine_no": "1236",
            "state": "TELANGANA",
        },
    ],
    "hello": [{"city": "demo", "id": 200, "machine_no": "3422", "state": "Rajasthan"}],
    "test": [{"city": "TEST1", "id": 201, "machine_no": "TEST", "state": "DD"}],
}

data = [
    [
        "10",
        "2023-12-22T08:42:40.229Z",
        "hardware",
        "Issue type: ",
        "pending",
        "high",
        "vijay",
        "ashish",
        "online",
        "navin",
        "1307",
    ],
    [
        "20",
        "2023-12-22T08:42:40.229Z",
        "software",
        "Issue type: ",
        "ongoing",
        "MEDIUM",
        "vijay",
        "ashish",
        "offline",
        "navin",
        "1308",
    ],
    [
        "30",
        "2023-12-22T08:42:40.229Z",
        "hardware",
        "Issue type: ",
        "done",
        "Low",
        "vijay",
        "ashish",
        "online",
        "navin",
        "1309",
    ],
]
# print("data->",data)


@app.route("/")
def support_page():
    temp_data = [
        {
            "id": "1",
            "machine no": "1300",
            "Type": "Hardware",
            "Lot_ID": "abcd11",
            "Expected Date": "2023-12-08T21:08:40.917Z",
            "Created Date": "2023-12-08T21:08:40.917Z",
            "End Date": "2023-12-08T21:08:40.917Z",
            "Issue": "this is the discription of the issue",
            "Crop": "PADDY",
            "priority": "High",
            "status": "pending",
            "machinestatus": "online",
            "Raised by whome": "name of creater",
            "Assigned to": "issue given to person",
            "Issues resolved by the team": "",
            "resolved by whome": "name of resolvers",
            "Issue Rise by team": "this is the discription of the issue by the team",
            "flag": False,
        },
    ]

    """
      # [Support id(0),
      support_date(1),
        Issue_type(2),
            error_detail(3),
            support_state(4),
            support_priority(5),
            assign_task(6),
            generated_by(7),
            support_mode(8),
            resolved_by(9),
            machine_code(10)]
      """
    get_individual_card_data = requests.get("http://127.0.0.1:5443/all_data").json()

    get_customer_cities_head_institution_wise = requests.get(
        "http://127.0.0.1:5443/get_customer_cities_head_institution_wise_data"
    ).json()
    # print(get_customer_cities_head_institution_wise['FCI'])
    """
    headInstitution{
      city,
      id,
      machine_no,
      state
    }
    """
    # print(data)

    return render_template(
        "base.html",
        fetch_data=get_individual_card_data,
        ticket_data=get_customer_cities_head_institution_wise,
    )


@app.route("/<issueType>")
def issue_support_page(issueType):
    # print(issueType)
    get_customer_cities_head_institution_wise = requests.get(
        "http://127.0.0.1:5443/get_customer_cities_head_institution_wise_data"
    ).json()

    if issueType == "hardware":
        get_individual_card_data = requests.get(
            "http://127.0.0.1:5443/specific_issue_data", json={"Issue_type": "hardware"}
        ).json()
        # data = get_individual_card_data.json()
        # print(data)
        # ticket_data = {
        #     "AMC JANGAON": [
        #         {
        #             "city": "AMC JANGAON",
        #             "id": 235,
        #             "machine_no": " AMC-J",
        #             "state": "TELANGANA",
        #         }
        #     ],
        # }
    elif issueType == "software":
        get_individual_card_data = requests.get(
            "http://127.0.0.1:5443/specific_issue_data", json={"Issue_type": "software"}
        ).json()

        # ticket_data = {
        #     "AMC JANGAON": [
        #         {
        #             "city": "AMC JANGAON",
        #             "id": 235,
        #             "machine_no": " AMC-J",
        #             "state": "TELANGANA",
        #         }
        #     ],
        # }

    elif issueType == "datateam":
        get_individual_card_data = requests.get(
            "http://127.0.0.1:5443/specific_issue_data", json={"Issue_type": "datateam"}
        ).json()

        # ticket_data = {
        #     "AMC JANGAON": [
        #         {
        #             "city": "AMC JANGAON",
        #             "id": 235,
        #             "machine_no": " AMC-J",
        #             "state": "TELANGANA",
        #         }
        #     ],
        # }

    else:
        get_individual_card_data = requests.get("http://127.0.0.1:5443/all_data").json()
    return render_template(
        "base.html",
        fetch_data=get_individual_card_data,
        ticket_data=get_customer_cities_head_institution_wise,
    )


if __name__ == "__main__":
    app.run(debug=True, port=5443)
