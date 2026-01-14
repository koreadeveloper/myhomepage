import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 면 타입 정의
type FaceType = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

// 큐비 인터페이스
interface Cubie extends THREE.Mesh {
    userData: {
        x: number;
        y: number;
        z: number;
    };
}

const RubiksCubeGame: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const cubiesRef = useRef<Cubie[]>([]);
    const isRotatingRef = useRef(false);
    const animationIdRef = useRef<number>(0);

    const [moves, setMoves] = useState(0);
    const [isSolved, setIsSolved] = useState(true);
    const [moveHistory, setMoveHistory] = useState<string[]>([]);

    // 색상 정의
    const COLORS = {
        white: 0xffffff,   // U (위)
        yellow: 0xffff00,  // D (아래)
        red: 0xff0000,     // F (앞)
        orange: 0xff8c00,  // B (뒤)
        blue: 0x0000ff,    // L (왼쪽)
        green: 0x00ff00,   // R (오른쪽)
        black: 0x111111,   // 내부
    };

    // 큐비 생성
    const createCubie = useCallback((x: number, y: number, z: number): Cubie => {
        const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);

        // 각 면의 색상 결정
        const materials: THREE.MeshStandardMaterial[] = [
            new THREE.MeshStandardMaterial({ color: x === 1 ? COLORS.green : COLORS.black }),  // +X (Right)
            new THREE.MeshStandardMaterial({ color: x === -1 ? COLORS.blue : COLORS.black }),  // -X (Left)
            new THREE.MeshStandardMaterial({ color: y === 1 ? COLORS.white : COLORS.black }),  // +Y (Up)
            new THREE.MeshStandardMaterial({ color: y === -1 ? COLORS.yellow : COLORS.black }),// -Y (Down)
            new THREE.MeshStandardMaterial({ color: z === 1 ? COLORS.red : COLORS.black }),    // +Z (Front)
            new THREE.MeshStandardMaterial({ color: z === -1 ? COLORS.orange : COLORS.black }),// -Z (Back)
        ];

        const cubie = new THREE.Mesh(geometry, materials) as Cubie;
        cubie.position.set(x, y, z);
        cubie.userData = { x, y, z };

        // 테두리 추가
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
        );
        cubie.add(line);

        return cubie;
    }, []);

    // 큐브 초기화
    const initCube = useCallback(() => {
        if (!sceneRef.current) return;

        // 기존 큐비 제거
        cubiesRef.current.forEach(cubie => {
            sceneRef.current?.remove(cubie);
        });
        cubiesRef.current = [];

        // 27개 큐비 생성
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const cubie = createCubie(x, y, z);
                    sceneRef.current.add(cubie);
                    cubiesRef.current.push(cubie);
                }
            }
        }

        setMoves(0);
        setMoveHistory([]);
        setIsSolved(true);
    }, [createCubie]);

    // 면 회전 (피벗 그룹 방식)
    const rotateFace = useCallback((face: FaceType, clockwise: boolean = true) => {
        if (isRotatingRef.current) return;
        isRotatingRef.current = true;

        // 해당 면에 속하는 큐비들 찾기
        const cubies = cubiesRef.current.filter(cubie => {
            const pos = cubie.position;
            const tolerance = 0.1;
            switch (face) {
                case 'U': return Math.abs(pos.y - 1) < tolerance;
                case 'D': return Math.abs(pos.y + 1) < tolerance;
                case 'L': return Math.abs(pos.x + 1) < tolerance;
                case 'R': return Math.abs(pos.x - 1) < tolerance;
                case 'F': return Math.abs(pos.z - 1) < tolerance;
                case 'B': return Math.abs(pos.z + 1) < tolerance;
                default: return false;
            }
        });

        // 피벗 그룹 생성
        const pivot = new THREE.Group();
        sceneRef.current?.add(pivot);

        // 큐비들을 피벗에 추가
        cubies.forEach(cubie => {
            pivot.attach(cubie);
        });

        // 회전 축 결정
        let axis: THREE.Vector3;
        switch (face) {
            case 'U': axis = new THREE.Vector3(0, 1, 0); break;
            case 'D': axis = new THREE.Vector3(0, -1, 0); break;
            case 'L': axis = new THREE.Vector3(-1, 0, 0); break;
            case 'R': axis = new THREE.Vector3(1, 0, 0); break;
            case 'F': axis = new THREE.Vector3(0, 0, 1); break;
            case 'B': axis = new THREE.Vector3(0, 0, -1); break;
        }

        const targetAngle = (clockwise ? -1 : 1) * Math.PI / 2;
        let currentAngle = 0;
        const speed = 0.15;

        // 애니메이션
        const animate = () => {
            const delta = Math.min(speed, Math.abs(targetAngle - currentAngle));
            const sign = targetAngle > 0 ? 1 : -1;

            pivot.rotateOnAxis(axis, sign * delta);
            currentAngle += sign * delta;

            if (Math.abs(currentAngle - targetAngle) > 0.001) {
                requestAnimationFrame(animate);
            } else {
                // 최종 정렬
                pivot.rotateOnAxis(axis, targetAngle - currentAngle);

                // 큐비들을 다시 씬에 추가
                cubies.forEach(cubie => {
                    sceneRef.current?.attach(cubie);

                    // 위치 반올림 (부동소수점 오차 제거)
                    cubie.position.x = Math.round(cubie.position.x);
                    cubie.position.y = Math.round(cubie.position.y);
                    cubie.position.z = Math.round(cubie.position.z);
                });

                // 피벗 제거
                sceneRef.current?.remove(pivot);
                isRotatingRef.current = false;

                // 이동 기록
                setMoves(m => m + 1);
                setMoveHistory(prev => [...prev, `${face}${clockwise ? '' : "'"}`]);
                setIsSolved(false);
            }
        };

        animate();
    }, []);

    // 키보드 이벤트 핸들러
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (isRotatingRef.current) return;

        const shift = e.shiftKey;
        switch (e.key.toUpperCase()) {
            case 'U': rotateFace('U', !shift); break;
            case 'D': rotateFace('D', !shift); break;
            case 'L': rotateFace('L', !shift); break;
            case 'R': rotateFace('R', !shift); break;
            case 'F': rotateFace('F', !shift); break;
            case 'B': rotateFace('B', !shift); break;
        }
    }, [rotateFace]);

    // 섞기
    const scramble = useCallback(async () => {
        const faces: FaceType[] = ['U', 'D', 'L', 'R', 'F', 'B'];
        const scrambleMoves = 20;

        for (let i = 0; i < scrambleMoves; i++) {
            const randomFace = faces[Math.floor(Math.random() * faces.length)];
            const clockwise = Math.random() > 0.5;

            // 순차적으로 회전
            await new Promise<void>(resolve => {
                const wait = () => {
                    if (!isRotatingRef.current) {
                        rotateFace(randomFace, clockwise);
                        setTimeout(resolve, 300);
                    } else {
                        setTimeout(wait, 50);
                    }
                };
                wait();
            });
        }
    }, [rotateFace]);

    // Three.js 씬 초기화
    useEffect(() => {
        if (!containerRef.current) return;

        // 씬 생성
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        sceneRef.current = scene;

        // 카메라 설정
        const camera = new THREE.PerspectiveCamera(
            50,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(4, 4, 4);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // 렌더러 설정
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 조명 추가
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, -5, -7);
        scene.add(directionalLight2);

        // OrbitControls 설정
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 4;
        controls.maxDistance = 15;
        controlsRef.current = controls;

        // 큐브 초기화
        initCube();

        // 애니메이션 루프
        const animateLoop = () => {
            animationIdRef.current = requestAnimationFrame(animateLoop);
            controls.update();
            renderer.render(scene, camera);
        };
        animateLoop();

        // 리사이즈 핸들러
        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // 키보드 이벤트
        window.addEventListener('keydown', handleKeyDown);

        // 클린업
        return () => {
            cancelAnimationFrame(animationIdRef.current);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            renderer.dispose();
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [initCube, handleKeyDown]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4 bg-slate-900">
            <h1 className="text-2xl font-bold text-white">🧊 3D 루빅스 큐브</h1>

            {/* 상태 표시 */}
            <div className="flex gap-4">
                <div className="bg-slate-800 rounded-xl px-4 py-2 shadow-lg text-center">
                    <div className="text-xs text-slate-400">이동</div>
                    <div className="text-2xl font-bold text-indigo-400">{moves}</div>
                </div>
            </div>

            {isSolved && moves > 0 && (
                <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold animate-bounce">
                    🎉 축하합니다! 큐브를 맞췄습니다!
                </div>
            )}

            {/* 3D 캔버스 컨테이너 */}
            <div
                ref={containerRef}
                className="w-full max-w-2xl aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700"
            />

            {/* 조작 버튼 */}
            <div className="bg-slate-800 rounded-xl p-4 shadow-lg">
                <div className="text-xs text-slate-400 text-center mb-2">면 회전 (시계방향 / 반시계방향)</div>
                <div className="grid grid-cols-6 gap-2">
                    <button onClick={() => rotateFace('U', true)} className="px-3 py-2 bg-white text-slate-800 rounded font-bold hover:bg-gray-200 transition-all">U</button>
                    <button onClick={() => rotateFace('U', false)} className="px-3 py-2 bg-white/80 text-slate-800 rounded font-bold hover:bg-gray-200 transition-all">U'</button>
                    <button onClick={() => rotateFace('D', true)} className="px-3 py-2 bg-yellow-400 text-slate-800 rounded font-bold hover:bg-yellow-300 transition-all">D</button>
                    <button onClick={() => rotateFace('D', false)} className="px-3 py-2 bg-yellow-300 text-slate-800 rounded font-bold hover:bg-yellow-200 transition-all">D'</button>
                    <button onClick={() => rotateFace('F', true)} className="px-3 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-400 transition-all">F</button>
                    <button onClick={() => rotateFace('F', false)} className="px-3 py-2 bg-red-400 text-white rounded font-bold hover:bg-red-300 transition-all">F'</button>
                    <button onClick={() => rotateFace('B', true)} className="px-3 py-2 bg-orange-500 text-white rounded font-bold hover:bg-orange-400 transition-all">B</button>
                    <button onClick={() => rotateFace('B', false)} className="px-3 py-2 bg-orange-400 text-white rounded font-bold hover:bg-orange-300 transition-all">B'</button>
                    <button onClick={() => rotateFace('L', true)} className="px-3 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-400 transition-all">L</button>
                    <button onClick={() => rotateFace('L', false)} className="px-3 py-2 bg-blue-400 text-white rounded font-bold hover:bg-blue-300 transition-all">L'</button>
                    <button onClick={() => rotateFace('R', true)} className="px-3 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-400 transition-all">R</button>
                    <button onClick={() => rotateFace('R', false)} className="px-3 py-2 bg-green-400 text-white rounded font-bold hover:bg-green-300 transition-all">R'</button>
                </div>
            </div>

            {/* 게임 버튼 */}
            <div className="flex gap-3">
                <button
                    onClick={scramble}
                    disabled={isRotatingRef.current}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50"
                >
                    🔀 섞기
                </button>
                <button
                    onClick={initCube}
                    className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-bold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg"
                >
                    🔄 초기화
                </button>
            </div>

            {/* 이동 기록 */}
            {moveHistory.length > 0 && (
                <div className="text-xs text-slate-400 max-w-md text-center">
                    <p className="mb-1">기록:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {moveHistory.slice(-15).map((move, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs">{move}</span>
                        ))}
                        {moveHistory.length > 15 && <span className="text-slate-500">...</span>}
                    </div>
                </div>
            )}

            {/* 도움말 */}
            <div className="text-xs text-slate-500 text-center max-w-md">
                <p>💡 마우스로 드래그하여 큐브를 회전시킬 수 있습니다.</p>
                <p>키보드: U, D, L, R, F, B (Shift+키 = 반시계방향)</p>
            </div>
        </div>
    );
};

export default RubiksCubeGame;
