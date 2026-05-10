import json
import uuid

def inject_exercises():
    data_path = r"d:\Apoliums 3\JS-Mentor-Backend\JS-Mentor\data.json"
    
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Dictionary of challenges for the first two cards
    # Card 0: Fundamentals
    fundamentals_challenges = [
        {
            "title": "Display Hello Mentor",
            "description": "Log 'Hello JS-Mentor' to the console and use alert() to show 'Welcome to the course'.",
            "difficulty": "Beginner",
            "tags": ["basics", "output"]
        },
        {
            "title": "Variable Checker",
            "description": "Create a variable 'age', check if it's over 18, and log 'Adult' or 'Minor' to the console.",
            "difficulty": "Beginner",
            "tags": ["variables", "logic"]
        },
        {
            "title": "Service Worker Init",
            "description": "Write a script that checks if 'serviceWorker' is in 'navigator' and logs 'SW Supported' if true.",
            "difficulty": "Beginner",
            "tags": ["environment", "pwa"]
        },
        {
            "title": "Const vs Let",
            "description": "Declare a const variable for your 'birthYear' and a let variable for 'currentScore'. Log both to the console.",
            "difficulty": "Beginner",
            "tags": ["variables", "es6"]
        },
        {
            "title": "Global vs Local",
            "description": "Define a global variable outside a function. Inside the function, define a local variable with the same name. Log both.",
            "difficulty": "Intermediate",
            "tags": ["scope", "variables"]
        },
        {
            "title": "Rectangle Area",
            "description": "Calculate the area of a rectangle with width 10 and height 20 using arithmetic operators. Print the result.",
            "difficulty": "Beginner",
            "tags": ["operators", "math"]
        },
        {
            "title": "Loop with Skip",
            "description": "Write a for loop that prints numbers 1 to 10, but use 'continue' to skip the number 5.",
            "difficulty": "Intermediate",
            "tags": ["loops", "control-flow"]
        },
        {
            "title": "Multiply Function",
            "description": "Create a function named 'multiply' that takes two parameters 'a' and 'b' and returns their product.",
            "difficulty": "Beginner",
            "tags": ["functions", "basics"]
        },
        {
            "title": "Fruit Object",
            "description": "Create an array 'fruits' with 3 names. Then create an object 'car' with 'brand' and 'model' properties.",
            "difficulty": "Beginner",
            "tags": ["arrays", "objects"]
        },
        {
            "title": "Safe JSON Parse",
            "description": "Write a try...catch block that attempts to parse a string '{\"name\": \"Alice\"}'. Log the name if successful.",
            "difficulty": "Intermediate",
            "tags": ["error-handling", "json"]
        }
    ]

    # Card 1: JavaScript Core
    js_core_challenges = [
        {
            "title": "The Counter Closure",
            "description": "Create a function 'makeCounter' that returns a function. Every time the returned function is called, it should increment and return a private variable.",
            "difficulty": "Intermediate",
            "tags": ["closures", "state"]
        },
        {
            "title": "Delayed Greeting",
            "description": "Write a function 'delayedGreeting' that takes a name and a callback. Use setTimeout to print 'Hello [name]' after 1 second, then run the callback.",
            "difficulty": "Intermediate",
            "tags": ["callbacks", "async"]
        },
        {
            "title": "Async Fetch Simulation",
            "description": "Create a function that returns a Promise. Resolve it with 'Success' after 2 seconds using setTimeout.",
            "difficulty": "Intermediate",
            "tags": ["promises", "async"]
        },
        {
            "title": "Click Toggle",
            "description": "Write code to add a click listener to a button with ID 'btn'. When clicked, toggle a class 'active' on it.",
            "difficulty": "Intermediate",
            "tags": ["dom", "events"]
        },
        {
            "title": "Root Background",
            "description": "Find an element with ID 'root' and change its style.backgroundColor to 'lightblue'.",
            "difficulty": "Beginner",
            "tags": ["dom", "style"]
        },
        {
            "title": "Dynamic List Builder",
            "description": "Create a <ul> element using document.createElement and append 3 <li> items to it with text 'Task 1', 'Task 2', 'Task 3'.",
            "difficulty": "Intermediate",
            "tags": ["dom", "manipulation"]
        },
        {
            "title": "API Data Logger",
            "description": "Use the Fetch API to get data from 'https://jsonplaceholder.typicode.com/posts/1' and log the title of the post.",
            "difficulty": "Intermediate",
            "tags": ["fetch", "async"]
        },
        {
            "title": "Object Serialization",
            "description": "Create a user object, convert it to a JSON string, then parse it back into a new object and log the name.",
            "difficulty": "Beginner",
            "tags": ["json", "basics"]
        },
        {
            "title": "Array Destructuring",
            "description": "Given an array ['red', 'green', 'blue'], use ES6 destructuring to assign the first two values to variables r and g.",
            "difficulty": "Beginner",
            "tags": ["es6", "destructuring"]
        },
        {
            "title": "Custom Error",
            "description": "Write a function that throws an error 'Invalid Input' if a number is less than 0. Handle it with a catch block.",
            "difficulty": "Intermediate",
            "tags": ["error-handling", "logic"]
        }
    ]

    all_challenges = [fundamentals_challenges, js_core_challenges]

    # Process first two cards
    for card_idx in range(min(2, len(data['cards']))):
        card = data['cards'][card_idx]
        links = card.get('links', [])
        challenges = all_challenges[card_idx]
        
        for link_idx in range(len(links)):
            link = links[link_idx]
            if 'pageContent' not in link:
                continue
            
            # Select challenge (cycle if more links than challenges)
            challenge_data = challenges[link_idx % len(challenges)]
            
            # Create a fresh copy with a unique ID
            exercise = {
                "id": str(uuid.uuid4()),
                "title": challenge_data["title"],
                "description": challenge_data["description"],
                "difficulty": challenge_data["difficulty"],
                "tags": challenge_data["tags"]
            }
            
            # Replace existing exercises with this one (user said 1 per page)
            link['pageContent']['exercises'] = [exercise]
            print(f"Injected exercise into {link.get('text')} ({link.get('url')})")

    # Save back to data.json
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
    
    print("\nInjection complete! data.json has been updated.")

if __name__ == "__main__":
    inject_exercises()
