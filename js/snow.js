document.addEventListener("DOMContentLoaded", function () {
    const snowContainer = document.querySelector(".snow-container");
    const snowToggleSwitch = document.getElementById("bottom-left-switch");
    const switchContainer = document.getElementById("snow-switch-container");
    const tooltip = document.getElementById("switch-tooltip");

    const particlesPerThousandPixels = 0.1;
    const fallSpeed = 0.8;
    const pauseWhenNotActive = true;
    const maxSnowflakes = 200;

    const snowflakes = [];
    let snowflakeInterval;
    let isTabActive = true;
    let snowEnabled = true;
    let hoverTimeout = null;

    function resetSnowflake(snowflake) {
        const size = Math.random() * 5 + 1;
        const viewportWidth = window.innerWidth - size; // Adjust for snowflake size
        const viewportHeight = window.innerHeight;

        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${Math.random() * viewportWidth}px`; // Constrain within viewport width
        snowflake.style.top = `-${size}px`;

        const animationDuration = (Math.random() * 3 + 2) / fallSpeed;
        snowflake.style.animationDuration = `${animationDuration}s`;
        snowflake.style.animationTimingFunction = "linear";
        snowflake.style.animationName =
            Math.random() < 0.5 ? "fall" : "diagonal-fall";

        setTimeout(() => {
            if (parseInt(snowflake.style.top, 10) < viewportHeight) {
                resetSnowflake(snowflake);
            } else {
                snowflake.remove(); // Remove when it goes off the bottom edge
            }
        }, animationDuration * 1000);
    }

    function createSnowflake() {
        if (snowflakes.length < maxSnowflakes) {
            const snowflake = document.createElement("div");
            snowflake.classList.add("snowflake");
            snowflakes.push(snowflake);
            snowContainer.appendChild(snowflake);
            resetSnowflake(snowflake);
        }
    }

    function generateSnowflakes() {
        const numberOfParticles =
            Math.ceil((window.innerWidth * window.innerHeight) / 1000) *
            particlesPerThousandPixels;
        const interval = 5000 / numberOfParticles;

        clearInterval(snowflakeInterval);
        snowflakeInterval = setInterval(() => {
            if (isTabActive && snowEnabled && snowflakes.length < maxSnowflakes) {
                requestAnimationFrame(createSnowflake);
            }
        }, interval);
    }

    function enableSnow() {
        snowEnabled = true;
        snowContainer.style.display = "block";
        snowContainer.classList.remove("fade-out");
        // Small delay to ensure the display change happens before opacity transition
        setTimeout(() => {
            generateSnowflakes();
        }, 50);
        localStorage.setItem("snowEnabled", "true");
    }

    function disableSnow() {
        snowEnabled = false;
        clearInterval(snowflakeInterval);
        
        // Add fade-out class for smooth transition
        snowContainer.classList.add("fade-out");
        
        // Wait for transition to complete before hiding and removing snowflakes
        setTimeout(() => {
            snowContainer.style.display = "none";
            // Remove all existing snowflakes
            snowflakes.forEach(snowflake => snowflake.remove());
            snowflakes.length = 0;
        }, 800); // Match the CSS transition duration
        
        localStorage.setItem("snowEnabled", "false");
    }

    function toggleSnow(enabled) {
        if (enabled) {
            enableSnow();
        } else {
            disableSnow();
        }
        updateTooltipText();
    }

    function updateTooltipText() {
        if (snowToggleSwitch && tooltip) {
            // When switch is checked (ON), show "Snow OFF" (action to turn it off)
            // When switch is unchecked (OFF), show "Snow ON" (action to turn it on)
            tooltip.textContent = snowToggleSwitch.checked ? "Snow OFF" : "Snow ON";
        }
    }

    function showTooltip() {
        if (tooltip) {
            tooltip.classList.add("show");
        }
    }

    function hideTooltip() {
        if (tooltip) {
            tooltip.classList.remove("show");
        }
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
    }

    function handleVisibilityChange() {
        if (!pauseWhenNotActive) return;

        isTabActive = !document.hidden;
        if (isTabActive) {
            generateSnowflakes();
        } else {
            clearInterval(snowflakeInterval);
        }
    }

    // Load snow state from localStorage
    const savedSnowState = localStorage.getItem("snowEnabled");
    if (savedSnowState !== null) {
        snowEnabled = savedSnowState === "true";
        if (snowToggleSwitch) {
            snowToggleSwitch.checked = snowEnabled;
        }
    }

    // Initialize snow based on saved state
    if (snowEnabled) {
        snowContainer.classList.remove("fade-out");
        generateSnowflakes();
    } else {
        snowContainer.style.display = "none";
        snowContainer.classList.add("fade-out");
    }

    // Add event listener to the switch
    if (snowToggleSwitch) {
        snowToggleSwitch.addEventListener("change", function() {
            toggleSnow(this.checked);
        });
    }

    // Add hover event listeners for tooltip with 1-second delay
    if (switchContainer) {
        switchContainer.addEventListener("mouseenter", function() {
            hoverTimeout = setTimeout(showTooltip, 1000);
        });

        switchContainer.addEventListener("mouseleave", function() {
            hideTooltip();
        });
    }

    // Initialize tooltip text
    updateTooltipText();

    window.addEventListener("resize", () => {
        if (snowEnabled) {
            clearInterval(snowflakeInterval);
            setTimeout(generateSnowflakes, 1000);
        }
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
});

