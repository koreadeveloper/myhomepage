import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 면 타입 정의
type FaceType = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

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

const RubiksCubeGame: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cubiesRef = useRef<THREE.Mesh[]>([]);
    const isRotatingRef = useRef(false);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    const [moves, setMoves] = useState(0);
    const [isSolved, setIsSolved] = useState(true);
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [isReady, setIsReady] = useState(false);

    // 큐비 생성 함수
    const createCubie = useCallback((x: number, y: number, z: number): THREE.Mesh => {
        const geometry = new THREE.BoxGeometry(0.93, 0.93, 0.93);

        // 각 면의 색상 결정
        const materials = [
            new THREE.MeshStandardMaterial({ color: x === 1 ? COLORS.green : COLORS.black }),  // +X (Right)
            new THREE.MeshStandardMaterial({ color: x === -1 ? COLORS.blue : COLORS.black }),  // -X (Left)
            new THREE.MeshStandardMaterial({ color: y === 1 ? COLORS.white : COLORS.black }),  // +Y (Up)
            new THREE.MeshStandardMaterial({ color: y === -1 ? COLORS.yellow : COLORS.black }),// -Y (Down)
            new THREE.MeshStandardMaterial({ color: z === 1 ? COLORS.red : COLORS.black }),    // +Z (Front)
            new THREE.MeshStandardMaterial({ color: z === -1 ? COLORS.orange : COLORS.black }),// -Z (Back)
        ];

        const cubie = new THREE.Mesh(geometry, materials);
        cubie.position.set(x, y, z);

        // 테두리 추가
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x000000 })
        );
        cubie.add(line);

        return cubie;
    }, []);

    // 면 회전 함수
    const rotateFace = useCallback((face: FaceType, clockwise: boolean = true) => {
        if (isRotatingRef.current || !sceneRef.current) return;
        isRotatingRef.current = true;

        const scene = sceneRef.current;
        const cubies = cubiesRef.current;

        // 해당 면에 속하는 큐비들 찾기
        const targetCubies = cubies.filter(cubie => {
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

        if (targetCubies.length === 0) {
            isRotatingRef.current = false;
            return;
        }

        // 피벗 그룹 생성
        const pivot = new THREE.Group();
        scene.add(pivot);

        // 큐비들을 피벗에 추가
        targetCubies.forEach(cubie => {
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
                targetCubies.forEach(cubie => {
                    scene.attach(cubie);

                    // 위치 반올림 (부동소수점 오차 제거)
                    cubie.position.x = Math.round(cubie.position.x);
                    cubie.position.y = Math.round(cubie.position.y);
                    cubie.position.z = Math.round(cubie.position.z);
                });

                // 피벗 제거
                scene.remove(pivot);
                isRotatingRef.current = false;

                // 이동 기록
                setMoves(m => m + 1);
                setMoveHistory(prev => [...prev, `${face}${clockwise ? '' : "'"}`]);
                setIsSolved(false);
            }
        };

        animate();
    }, []);

    // 큐브 초기화
    const resetCube = useCallback(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        // 기존 큐비 제거
        cubiesRef.current.forEach(cubie => {
            scene.remove(cubie);
            cubie.geometry.dispose();
            if (Array.isArray(cubie.material)) {
                cubie.material.forEach(m => m.dispose());
            }
        });
        cubiesRef.current = [];

        // 27개 큐비 생성
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const cubie = createCubie(x, y, z);
                    scene.add(cubie);
                    cubiesRef.current.push(cubie);
                }
            }
        }

        setMoves(0);
        setMoveHistory([]);
        setIsSolved(true);

        // 카메라 위치 초기화 (중앙으로 리셋)
        if (cameraRef.current) {
            cameraRef.current.position.set(4, 3, 4);
            cameraRef.current.lookAt(0, 0, 0);
        }
        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
        }
    }, [createCubie]);

    // 섞기
    const scramble = useCallback(async () => {
        if (!isReady) return;

        const faces: FaceType[] = ['U', 'D', 'L', 'R', 'F', 'B'];

        for (let i = 0; i < 20; i++) {
            const randomFace = faces[Math.floor(Math.random() * faces.length)];
            const clockwise = Math.random() > 0.5;

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
    }, [rotateFace, isReady]);

    // Three.js 초기화
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 씬 생성
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        sceneRef.current = scene;

        // 컨테이너 크기 (반응형)
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 300;

        // 카메라 설정
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(4, 3, 4);
        camera.lookAt(0, 0, 0);

        // 렌더러 설정
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 리사이즈 핸들러
        const handleResize = () => {
            const w = container.clientWidth || 400;
            const h = container.clientHeight || 300;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

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

        // ref에 저장
        cameraRef.current = camera;
        controlsRef.current = controls;

        // 27개 큐비 생성
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const geometry = new THREE.BoxGeometry(0.93, 0.93, 0.93);
                    const materials = [
                        new THREE.MeshStandardMaterial({ color: x === 1 ? COLORS.green : COLORS.black }),
                        new THREE.MeshStandardMaterial({ color: x === -1 ? COLORS.blue : COLORS.black }),
                        new THREE.MeshStandardMaterial({ color: y === 1 ? COLORS.white : COLORS.black }),
                        new THREE.MeshStandardMaterial({ color: y === -1 ? COLORS.yellow : COLORS.black }),
                        new THREE.MeshStandardMaterial({ color: z === 1 ? COLORS.red : COLORS.black }),
                        new THREE.MeshStandardMaterial({ color: z === -1 ? COLORS.orange : COLORS.black }),
                    ];
                    const cubie = new THREE.Mesh(geometry, materials);
                    cubie.position.set(x, y, z);

                    const edges = new THREE.EdgesGeometry(geometry);
                    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
                    cubie.add(line);

                    scene.add(cubie);
                    cubiesRef.current.push(cubie);
                }
            }
        }

        setIsReady(true);

        // 애니메이션 루프
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // 키보드 이벤트
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isRotatingRef.current) return;
            const shift = e.shiftKey;
            const key = e.key.toUpperCase();
            if (['U', 'D', 'L', 'R', 'F', 'B'].includes(key)) {
                rotateFace(key as FaceType, !shift);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // 클린업
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);
            controls.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            cubiesRef.current = [];
            sceneRef.current = null;
        };
    }, [rotateFace]);

    return (
        <div className="flex flex-col items-center w-full min-h-screen p-4 gap-4 bg-slate-900 overflow-y-auto">
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
                className="rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-800 w-full max-w-[600px]"
                style={{ height: 'min(400px, 60vw)' }}
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
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                >
                    🔀 섞기
                </button>
                <button
                    onClick={resetCube}
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
            <div className="text-xs text-slate-500 text-center max-w-md pb-4">
                <p>💡 마우스 드래그: 큐브 시점 회전 | 휠: 줌</p>
                <p>키보드: U, D, L, R, F, B (Shift = 반시계)</p>
            </div>
        </div>
    );
};

export default RubiksCubeGame;
