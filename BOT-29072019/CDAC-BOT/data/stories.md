## happy path
* greet
  - utter_greet
* mood_great
  - utter_happy

## sad path 1
* greet
  - utter_greet
* mood_unhappy
  - utter_cheer_up
  - utter_did_that_help
* affirm
  - utter_happy

## sad path 2
* greet
  - utter_greet
* mood_unhappy
  - utter_cheer_up
  - utter_did_that_help
* deny
  - utter_goodbye

## say goodbye
* goodbye
  - utter_goodbye

## long story
* greet
    - utter_greet
* ccat_info
    - utter_ccat_info
* course_payment
    - utter_course_payment_mode
* course_PGDAC
    - utter_pgdac
* mood_great
    - utter_happy
* course_payment
    - utter_course_payment_yes
* course_PGDBDA
    - utter_PGDBDA
* course_PGDIoT
    - utter_PGDIoT
* course_PGVLSI
    - utter_PGVLSI
* course_PGDGI
    - utter_PGDGI
* course_PGDMC
    - utter_PGDMC
* goodbye
    - utter_goodbye
