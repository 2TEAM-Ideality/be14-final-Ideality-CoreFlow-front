<template>
    <div>
        <!-- 버튼을 클릭하여 모달을 열 수 있음 -->
        <button @click="showModal = true">세부 일정 생성</button>

        <!-- 모달이 열릴 때만 표시 -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">

                <h2>세부 일정 생성</h2>
                <!-- 닫기 X 버튼 -->
                <span class="close-btn" @click="closeModal">X</span>

                <hr /> <!-- 구분선 -->
                <form @submit.prevent="submitForm">
                    <!-- 세부 일정 제목 -->
                    <div>
                        <label for="title">세부 일정 제목:</label>
                        <input type="text" id="title" v-model="form.title" required />
                    </div>

                    <!-- 세부 일정 설명 -->
                    <div>
                        <label for="description">세부 일정 설명:</label>
                        <textarea id="description" v-model="form.description" required></textarea>
                    </div>

                    <!-- 날짜 선택 (시작/마감 베이스라인 한 줄에 배치) -->
                    <div class="inline-fields-baseline">
                        <label for="start-date">시작 베이스라인:</label>
                        <div class="baseline-group">
                            <input type="date" id="start-date" v-model="form.startDate" required />
                        </div>

                        <label for="end-date">마감 베이스라인:</label>
                        <div class="baseline-group">
                            <input type="date" id="end-date" v-model="form.endDate" required />
                        </div>
                    </div>

                    <!-- 담당 부서 -->
                    <div>
                        <label for="department">담당 부서:</label>
                        <select id="department" v-model="form.department">
                            <option value="md팀">md팀</option>
                            <option value="개발팀">개발팀</option>
                            <option value="디자인팀">디자인팀</option>
                        </select>
                    </div>

                    <!-- 선행일정 / 후행일정 -->
                    <div class="inline-fields">
                        <!-- 선행일정 -->
                        <div class="field-container">
                            <div class="label-container">
                                <label for="preceding-task">선행 일정:</label>
                                <button type="button" class="add-btn" @click="addPrecedingTask">+</button>
                            </div>
                            <div v-for="(preceding, index) in form.precedingTasks" :key="'preceding-' + index" class="field-group">
                                <select v-model="form.precedingTasks[index]">
                                    <option v-for="task in tasks" :key="task.id" :value="task.name">
                                        {{ task.name }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <!-- 후행일정 -->
                        <div class="field-container">
                            <div class="label-container">
                                <label for="following-task">후행 일정:</label>
                                <button type="button" class="add-btn" @click="addFollowingTask">+</button>
                            </div>
                            <div v-for="(following, index) in form.followingTasks" :key="'following-' + index" class="field-group">
                                <select v-model="form.followingTasks[index]">
                                    <option v-for="task in tasks" :key="task.id" :value="task.name">
                                        {{ task.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 책임자 -->
                    <div>
                        <label for="responsible">책임자:</label>
                        <input type="text" id="responsible" v-model="form.responsible" />
                    </div>

                    <!-- 참여자 -->
                    <div>
                        <label for="participants">참여자:</label>
                        <input type="text" id="participants" v-model="form.participants" />
                    </div>

                    <!-- 제출 버튼 -->
                    <button type="submit">추가</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showModal: false,
            form: {
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                department: "md팀",
                precedingTasks: [""], // 초기값 하나로 수정
                followingTasks: [""], // 초기값 하나로 수정
                responsible: "",
                participants: "",
            },
            tasks: [
                { id: 1, name: "Task 1" },
                { id: 2, name: "Task 2" },
                { id: 3, name: "Task 3" },
            ],
        };
    },
    methods: {
        closeModal() {
            this.showModal = false;
        },
        submitForm() {
            console.log("폼 제출:", this.form);
            // 폼 제출 처리 로직을 추가하세요 (예: 서버로 전송)
            this.closeModal();
        },
        addPrecedingTask() {
            // 선행일정 배열에 빈 값 추가
            this.form.precedingTasks.push("");
        },
        addFollowingTask() {
            // 후행일정 배열에 빈 값 추가
            this.form.followingTasks.push("");
        },
    },
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    padding: 20px 40px;
    border-radius: 0px;
    width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    margin-top: 50px;
    position: relative;
}

button {
    margin-top: 10px;
    padding: 8px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
}

button:hover {
    background-color: #0056b3;
}

label {
    margin-top: 10px;
    font-weight: bold;
}

input,
select,
textarea {
    width: 100%;
    padding: 1px 6px;
    margin-top: 3px;
    border: 1px solid #ddd;
}

textarea {
    height: 80px;
}

hr {
    margin: 20px 0;
    border: 1px solid #ddd;
}

.close-btn {
    position: absolute;
    top: 18px;
    right: 40px;
    font-size: 25px;
    cursor: pointer;
    color: #000;
    font-weight: bold;
    background-color: transparent;
    border: none;
    padding: 5px;
}

.inline-fields {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 10px;
}

.field-container {
    flex: 1;
}

.field-group {
    margin-top: 5px;
    display: flex;
    align-items: center;
}

.label-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.add-btn {
    background-color: transparent;
    border: 2px solid black;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    color: black;
    font-weight: bold;
    text-align: center;
    line-height: 10px;
    cursor: pointer;
    padding: 0;
}

.add-btn:hover {
    background-color: #f0f0f0;
}

form > div {
    margin-bottom: 20px;
}
</style>
