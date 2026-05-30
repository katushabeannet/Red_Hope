from django.conf import settings
from neo4j import GraphDatabase


class Neo4jClient:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
        )

    def close(self):
        self.driver.close()

    def create_eligibility_trace(
        self,
        donor_email,
        full_name,
        is_eligible,
        summary,
        reasons,
    ):
        query = """
        MERGE (d:DonorUser {email: $donor_email})
        SET d.full_name = $full_name

        CREATE (e:EligibilityAssessment {
            is_eligible: $is_eligible,
            summary: $summary,
            reasons: $reasons,
            created_at: datetime()
        })

        MERGE (d)-[:GENERATES_ELIGIBILITY]->(e)
        """

        with self.driver.session() as session:
            session.run(
                query,
                donor_email=donor_email,
                full_name=full_name,
                is_eligible=is_eligible,
                summary=summary,
                reasons=reasons,
            )

    def create_availability_trace(
        self,
        donor_email,
        full_name,
        is_available,
        probability,
        summary,
        reasons,
    ):
        query = """
        MERGE (d:DonorUser {email: $donor_email})
        SET d.full_name = $full_name

        CREATE (a:AvailabilityAssessment {
            is_available: $is_available,
            probability: $probability,
            summary: $summary,
            reasons: $reasons,
            created_at: datetime()
        })

        MERGE (d)-[:GENERATES_AVAILABILITY]->(a)
        """

        with self.driver.session() as session:
            session.run(
                query,
                donor_email=donor_email,
                full_name=full_name,
                is_available=is_available,
                probability=probability,
                summary=summary,
                reasons=reasons,
            )

    def create_nearest_camp_trace(
        self,
        user_identifier,
        user_type,
        latitude,
        longitude,
        camp_id,
        camp_name,
        district,
        venue,
        camp_latitude,
        camp_longitude,
        distance_km,
    ):
        query = """
        MERGE (u:PlatformUser {identifier: $user_identifier})
        SET u.user_type = $user_type,
            u.latitude = $latitude,
            u.longitude = $longitude

        MERGE (c:DonationCamp {camp_id: $camp_id})
        SET c.name = $camp_name,
            c.district = $district,
            c.venue = $venue,
            c.latitude = $camp_latitude,
            c.longitude = $camp_longitude

        CREATE (r:NearestCampRecommendation {
            distance_km: $distance_km,
            created_at: datetime()
        })

        MERGE (u)-[:RECOMMENDED_NEAREST_CAMP]->(r)
        MERGE (r)-[:POINTS_TO_CAMP]->(c)
        """

        with self.driver.session() as session:
            session.run(
                query,
                user_identifier=user_identifier,
                user_type=user_type,
                latitude=latitude,
                longitude=longitude,
                camp_id=camp_id,
                camp_name=camp_name,
                district=district,
                venue=venue,
                camp_latitude=camp_latitude,
                camp_longitude=camp_longitude,
                distance_km=distance_km,
            )

    def create_chatbot_trace(
        self,
        user_identifier,
        user_type,
        user_query,
        matched_question,
        answer,
        similarity_score,
        confidence,
    ):
        query = """
        MERGE (u:PlatformUser {identifier: $user_identifier})
        SET u.user_type = $user_type

        CREATE (q:Question {
            text: $user_query,
            created_at: datetime()
        })

        CREATE (r:RetrievalResult {
            matched_question: $matched_question,
            answer: $answer,
            similarity_score: $similarity_score,
            confidence: $confidence,
            created_at: datetime()
        })

        MERGE (u)-[:ASKED_QUESTION]->(q)
        MERGE (q)-[:MATCHED_QA]->(r)
        """

        with self.driver.session() as session:
            session.run(
                query,
                user_identifier=user_identifier,
                user_type=user_type,
                user_query=user_query,
                matched_question=matched_question,
                answer=answer,
                similarity_score=similarity_score,
                confidence=confidence,
            )