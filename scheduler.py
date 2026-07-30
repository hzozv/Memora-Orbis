# THIS IS A SCHEDULING ALGORIHM INSPIRED BY A SIMPLIFIED VERSION OF FCSC

import math
from datetime import datetime, timedelta

# The number of days it takes for recall to drop to 90%
# Retrievability = (%) of rememberance
def retrievability(days_elapsed, current_stability):
    return (1.0 + (19.0 / 81.0) * (days_elapsed / current_stability)) ** (-0.5)


# Use a weight factor + rating provided by user to determine difficulty 
# Difficulty = How difficult a topic is
def difficulty(current_difficulty, rating):
    # Case 1: New task item (no difficulty)
    if current_difficulty is None:
        initial_difficulty = 10.0 - 2.0 * (rating-1)
    # limit so something doesn't become infinitely difficult
        return max(1.0, min(10.0, initial_difficulty))


    # Case 2: Difficulty exsists
    weight = 0.5
    change_in_difficulty = -weight * (rating-3)
    new_difficulty = current_difficulty + change_in_difficulty

    # limit so something doesn't become infinitely difficult
    return max(1.0, min(10.0, new_difficulty))


# Sets initial stability (in days) for a brand new card based on first rating
# Stability = Amount of time (in days) a memory will last in your head
def initial_stability(rating):
    stabilities = {1: 0.4, 2: 1.0, 3: 3.0, 4: 6.0}
    return stabilities.get(rating, 3)


# Calculates a new stability based on difficulty, stability, retrievability, and rating
def updated_stability(stability, difficulty, retrievability, rating):
    # Stability drop for decay
    if rating == 1:
      return max(0.5, stability * 0.2)

    # Determinants of how much stabilty should increase
    difficulty_factor = 11 - difficulty
    retrievability_factor = math.exp(1 - retrievability)
    rating_multipliers = {2: 1.2, 3: 1.5, 4: 2.0}
    rating_boost = rating_multipliers.get(rating, 1.5)

    # Calculating new stability based on determinants
    # Schedules the next review
    growth_factor = 1 + (0.1 * difficulty_factor * retrievability_factor * rating_boost)
    new_stability = growth_factor * stability
    return round(new_stability, 2)


# Create new item
def create_task(title):
    return {
        "title": title,
        "difficulty": None,
        "stability": None,
        "last_reviewed": None,
        "next_review": None,
    }


# Updates Retrievability, Difficulty, Stability, Review Dates
'''
task_data = {
    "title": String,
    "difficulty": None / Float,
    "stability": None / Float,
    "last_reviewed": None / Date,
    "next_review": Date + Stability,
}
'''
def process_review(task_data, rating): 
    today = datetime.now()
    # Case 1: First time completing a task
    if task_data.get("last_reviewed") is None:
        new_difficulty = difficulty(None, rating)
        new_stability = initial_stability(rating)

    # Case 2: Task has been completed before
    else:
        # Calculate days elapsed
        last_date = datetime.strptime(task_data["last_reviewed"], "%d/%m/%Y")
        days_elapsed = max(0, (today - last_date).days)

        # Current metrics
        current_difficulty = task_data["difficulty"]
        current_stability = task_data["stability"]
        current_retrievability = retrievability(days_elapsed, current_stability)

        # Update current metrics
        new_difficulty = difficulty(current_difficulty, rating)
        new_stability = updated_stability(current_stability, new_difficulty, current_retrievability, rating)

    # Next due date
    next_due = today + timedelta(days=new_stability)

    # return updated dictionary to database
    return {
        "difficulty": new_difficulty,
        "stability": new_stability,
        "last_reviewed": today.strftime("%d/%m/%Y"),
        "next_review": next_due.strftime("%d/%m/%Y")
    }