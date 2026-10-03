async function loadPartyList() {
    const container = document.getElementById("mp");

    if (!container) return;

    try {
        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error("ไม่สามารถโหลดข้อมูล ส.ส. ได้");
        }

        const members = await response.json();

        container.innerHTML = "";

        members.forEach((member) => {

            const card = document.createElement("div");
            card.className = "profile-card";

            card.innerHTML = `
                <img src="${member.image}" alt="${member.firstName} ${member.lastName}">
                <h3>
                    ${member.firstName}<br>
                    <span>${member.lastName}</span>
                </h3>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <p class="load-error">
                ไม่สามารถโหลดข้อมูล ส.ส. ได้
            </p>
        `;
    }
}

loadPartyList();