"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Type definitions
interface LipSyncCue {
  start: number;
  end: number;
  value: string;
}

interface LipSyncData {
  metadata?: {
    soundFile?: string;
    duration?: number;
  };
  mouthCues: LipSyncCue[];
}

export interface VideoChatRef {
  generateLipSyncFromAudio: (audioBlob: Blob) => Promise<void>;
}

interface VideoChatProps {
  isActive: boolean;
  className?: string;
}

// Improved Avatar component with robust fallback system
function AvatarModel({
  lipSyncData,
  isPlaying,
}: {
  lipSyncData: LipSyncData | null;
  isPlaying: boolean;
}) {
  // Load the model files
  const { nodes, materials, scene } = useGLTF("/684c911728e0929137bd898f.glb");
  const { animations } = useGLTF("/animation.glb");

  const group = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, group);
  const [currentTime, setCurrentTime] = useState(0);
  const [blink, setBlink] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<string>("X");
  const [hasMorphTargets, setHasMorphTargets] = useState(false);
  // const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);

  // Enhanced phoneme mappings
  const morphTargetMappings = {
    A: ["viseme_aa", "mouth_A", "jawOpen", "mouthOpen"],
    B: ["viseme_PP", "mouth_B", "mouthClose", "lipsClosed"],
    C: ["viseme_I", "mouth_C", "mouthSmile", "mouthNarrow"],
    D: ["viseme_AA", "mouth_D", "tongueOut", "mouthWide"],
    E: ["viseme_O", "mouth_E", "mouthFunnel", "mouthRound"],
    F: ["viseme_U", "mouth_F", "mouthPucker", "lipsBite"],
    G: ["viseme_kk", "mouth_G", "mouthLeft", "mouthBack"],
    H: ["viseme_CH", "mouth_H", "mouthShrugLower", "mouthBreathe"],
    X: ["viseme_sil", "mouth_X", "mouthNeutral", "mouthRest", "neutral"],
  };

  // Body animation fallback for when no morph targets exist
  const bodyAnimationMappings = {
    A: "TalkingMan01", // Calm speaking
    B: "TalkingMan02", // Emphatic speaking
    C: "TalkingWoman01", // Gentle speaking
    D: "TalkingWoman02", // Animated speaking
    E: "TalkingMan01", // Back to calm
    F: "TalkingMan02", // Emphatic again
    G: "TalkingWoman01", // Gentle again
    H: "TalkingWoman02", // Animated again
    X: "TalkingMan01", // Default/rest speaking
  };

  // Animation timing
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }

    if (isPlaying && lipSyncData) {
      setCurrentTime((prev) => prev + delta);
    }
  });

  // Helper function to apply morph targets
  const applyMorphTarget = (targetName: string, value: number): boolean => {
    let found = false;

    scene.traverse((child: any) => {
      if (
        child.isSkinnedMesh &&
        child.morphTargetDictionary &&
        child.morphTargetInfluences
      ) {
        const index = child.morphTargetDictionary[targetName];
        if (
          index !== undefined &&
          child.morphTargetInfluences[index] !== undefined
        ) {
          child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[index],
            value,
            0.2
          );
          found = true;
        }
      }
    });

    return found;
  };

  // Reset all morph targets
  const resetAllMorphTargets = () => {
    scene.traverse((child: any) => {
      if (child.isSkinnedMesh && child.morphTargetInfluences) {
        for (let i = 0; i < child.morphTargetInfluences.length; i++) {
          child.morphTargetInfluences[i] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[i],
            0,
            0.1
          );
        }
      }
    });
  };

  // Play body animation (fallback method)
  const playBodyAnimation = (phoneme: string) => {
    const animationName =
      bodyAnimationMappings[phoneme as keyof typeof bodyAnimationMappings];

    if (actions && animationName && actions[animationName]) {
      // Only change animation if it's different from what's currently playing
      const currentAnimation = Object.values(actions).find((action) =>
        action.isRunning()
      );
      const targetAction = actions[animationName];

      // If the target animation is already running, don't restart it
      if (targetAction.isRunning()) {
        return true;
      }

      // Fade out all other animations
      Object.values(actions).forEach((action) => {
        if (action !== targetAction && action.isRunning()) {
          action.fadeOut(0.5);
        }
      });

      // Start the new animation with loop
      targetAction
        .reset()
        .setLoop(THREE.LoopRepeat, Infinity)
        .fadeIn(0.5)
        .play();

      console.log(
        `🎭 Starting looped animation: ${animationName} for phoneme ${phoneme}`
      );
      return true;
    }

    return false;
  };

  // Scan for available features on mount
  useEffect(() => {
    if (scene && animations) {
      console.log("🔍 Scanning avatar capabilities...");

      // Check for morph targets
      let foundMorphTargets = false;
      const allMorphTargets = new Set<string>();

      scene.traverse((child: any) => {
        if (child.isSkinnedMesh && child.morphTargetDictionary) {
          foundMorphTargets = true;
          console.log(
            `📝 Found morph targets on "${child.name}":`,
            Object.keys(child.morphTargetDictionary)
          );
          Object.keys(child.morphTargetDictionary).forEach((key) =>
            allMorphTargets.add(key)
          );
        }
      });

      setHasMorphTargets(foundMorphTargets);

      // Check available animations
      // const animNames = animations.map((anim: any) => anim.name);
      // setAvailableAnimations(animNames);
      // console.log("🎬 Available animations:", animNames);

      if (foundMorphTargets) {
        console.log(
          "✅ MORPH TARGET MODE: Using facial expressions for lip-sync"
        );
        console.log(
          "🎯 Available morph targets:",
          Array.from(allMorphTargets).sort()
        );

        // Check which phonemes we can handle
        Object.entries(morphTargetMappings).forEach(([phoneme, targets]) => {
          const available = targets.find((target) =>
            allMorphTargets.has(target)
          );
          console.log(
            `  ${phoneme} → ${available ? available + " ✅" : "NONE ❌"}`
          );
        });
      } else {
        console.log(
          "🎭 BODY ANIMATION MODE: Using body movements for speech indication"
        );

        // Check which animations we can use
        const animNames = animations.map((anim: any) => anim.name);
        Object.entries(bodyAnimationMappings).forEach(([phoneme, animName]) => {
          const available = animNames.includes(animName);
          console.log(`  ${phoneme} → ${animName}: ${available ? "✅" : "❌"}`);
        });
      }
    }
  }, [scene, animations]);

  // Set up idle animation
  useEffect(() => {
    if (actions && animations.length > 0) {
      // Find best idle animation
      const idleOptions = [
        animations.find((a) => a.name.toLowerCase().includes("idle")),
        animations.find((a) => a.name.toLowerCase().includes("breathing")),
        animations.find((a) => a.name === "TalkingMan01"),
        animations[0], // Fallback to first animation
      ].filter(Boolean);

      const idleAnimation = idleOptions[0];

      if (idleAnimation && actions[idleAnimation.name]) {
        // Stop all animations first
        Object.values(actions).forEach((action) => {
          action?.stop();
        });

        // Start idle animation with infinite loop
        actions[idleAnimation.name]
          ?.reset()
          .setLoop(THREE.LoopRepeat, Infinity)
          .play();
        console.log("😴 Playing looped idle animation:", idleAnimation.name);
      }
    }
  }, [actions, animations]);

  // Handle blinking
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 150);
      }, THREE.MathUtils.randInt(2000, 6000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Main lip-sync logic
  useFrame(() => {
    // Handle blinking (works for both modes)
    applyMorphTarget("eyeBlinkLeft", blink ? 1 : 0);
    applyMorphTarget("eyeBlinkRight", blink ? 1 : 0);

    // Handle lip-sync
    if (!lipSyncData || !isPlaying) {
      if (hasMorphTargets) {
        resetAllMorphTargets();
      }
      setCurrentViseme("X");
      return;
    }

    // Find current mouth cue
    const currentCue = lipSyncData.mouthCues?.find(
      (cue: LipSyncCue, index: number) => {
        const nextCue = lipSyncData.mouthCues[index + 1];
        return (
          currentTime >= cue.start && (!nextCue || currentTime < nextCue.start)
        );
      }
    );

    // Only change animation when phoneme actually changes
    if (currentCue && currentCue.value !== currentViseme) {
      const phoneme = currentCue.value;
      setCurrentViseme(phoneme);

      console.log(
        `[${currentTime.toFixed(
          2
        )}s] Phoneme changed: ${phoneme} (${currentCue.start.toFixed(
          2
        )}-${currentCue.end.toFixed(2)})`
      );

      if (hasMorphTargets) {
        // MORPH TARGET MODE: Use facial expressions
        resetAllMorphTargets();

        const targets =
          morphTargetMappings[phoneme as keyof typeof morphTargetMappings] ||
          [];
        let applied = false;

        for (const target of targets) {
          if (applyMorphTarget(target, 1.0)) {
            console.log(`👄 Applied morph target: ${target}`);
            applied = true;
            break;
          }
        }

        if (!applied) {
          console.warn(`❌ No morph target found for phoneme: ${phoneme}`);
        }
      } else {
        // BODY ANIMATION MODE: Use body movements
        const applied = playBodyAnimation(phoneme);

        if (!applied) {
          console.warn(`❌ No body animation found for phoneme: ${phoneme}`);
        }
      }
    }
  });

  return (
    <group
      ref={group}
      scale={[3.5, 3.5, 3.5]}
      position={[0, -4.5, 0]}
      dispose={null}
    >
      <primitive object={nodes.Hips} />
      {/* Conditionally render mesh components */}
      {nodes.Wolf3D_Body && (
        <skinnedMesh
          name="Wolf3D_Body"
          geometry={nodes.Wolf3D_Body?.geometry}
          material={materials.Wolf3D_Body}
          skeleton={nodes.Wolf3D_Body?.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Bottom && (
        <skinnedMesh
          name="Wolf3D_Outfit_Bottom"
          geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
          material={materials.Wolf3D_Outfit_Bottom}
          skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Footwear && (
        <skinnedMesh
          name="Wolf3D_Outfit_Footwear"
          geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
          material={materials.Wolf3D_Outfit_Footwear}
          skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Top && (
        <skinnedMesh
          name="Wolf3D_Outfit_Top"
          geometry={nodes.Wolf3D_Outfit_Top.geometry}
          material={materials.Wolf3D_Outfit_Top}
          skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
        />
      )}
      {nodes.Wolf3D_Hair && (
        <skinnedMesh
          name="Wolf3D_Hair"
          geometry={nodes.Wolf3D_Hair.geometry}
          material={materials.Wolf3D_Hair}
          skeleton={nodes.Wolf3D_Hair.skeleton}
        />
      )}
      {nodes.EyeLeft && (
        <skinnedMesh
          name="EyeLeft"
          geometry={nodes.EyeLeft.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
      )}
      {nodes.EyeRight && (
        <skinnedMesh
          name="EyeRight"
          geometry={nodes.EyeRight.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Head && (
        <skinnedMesh
          name="Wolf3D_Head"
          geometry={nodes.Wolf3D_Head.geometry}
          material={materials.Wolf3D_Skin}
          skeleton={nodes.Wolf3D_Head.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Teeth && (
        <skinnedMesh
          name="Wolf3D_Teeth"
          geometry={nodes.Wolf3D_Teeth.geometry}
          material={materials.Wolf3D_Teeth}
          skeleton={nodes.Wolf3D_Teeth.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
        />
      )}
    </group>
  );
}

const VideoChat = React.forwardRef<VideoChatRef, VideoChatProps>(
  ({ isActive, className }, ref) => {
    const [lipSyncData, setLipSyncData] = useState<LipSyncData | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const generateLipSyncFromAudio = async (audioBlob: Blob) => {
      try {
        console.log("🎤 Generating lip-sync from audio blob:", audioBlob);

        const formData = new FormData();
        formData.append("audio", audioBlob, "speech.wav");

        const response = await fetch("/api/lipsync", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Lip-sync API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("📋 Received lip-sync data:", data);
        console.log(
          `📊 Duration: ${data.metadata?.duration || "unknown"}s, Cues: ${
            data.mouthCues?.length || 0
          }`
        );

        setLipSyncData(data);
        setIsPlaying(true);

        // Stop playing after the duration
        if (data.mouthCues && data.mouthCues.length > 0) {
          const duration = Math.max(
            ...data.mouthCues.map((cue: LipSyncCue) => cue.end)
          );
          console.log(`⏱️ Setting lip-sync duration: ${duration}s`);
          setTimeout(() => {
            console.log("🔇 Lip-sync completed");
            setIsPlaying(false);
            setLipSyncData(null);
          }, duration * 1000 + 500);
        }
      } catch (error) {
        console.error("❌ Error generating lip-sync:", error);
      }
    };

    React.useImperativeHandle(ref, () => ({
      generateLipSyncFromAudio,
    }));

    if (!isActive) return null;

    return (
      <div className={className}>
        <Canvas
          camera={{ position: [0, 1, 4], fov: 50 }}
          style={{
            background: "linear-gradient(135deg, #f9fbff 0%, #f1f6fc 100%)",
          }}
        >
          {/* Enhanced lighting setup */}
          <ambientLight intensity={1.2} color="#ffffff" />
          <directionalLight
            position={[2, 4, 3]}
            intensity={1.5}
            color="#ffffff"
            castShadow
          />
          <directionalLight
            position={[-2, 2, 2]}
            intensity={0.8}
            color="#f0f8ff"
          />
          <directionalLight
            position={[0, 2, -3]}
            intensity={0.6}
            color="#e6f3ff"
          />
          <pointLight
            position={[1, 2, 2]}
            intensity={1.0}
            color="#ffffff"
            distance={10}
            decay={2}
          />
          <pointLight
            position={[-1, 2, 2]}
            intensity={0.8}
            color="#f8faff"
            distance={8}
            decay={2}
          />
          <spotLight
            position={[0, 5, 2]}
            angle={0.4}
            penumbra={0.5}
            intensity={1.2}
            color="#ffffff"
            castShadow
          />

          <AvatarModel lipSyncData={lipSyncData} isPlaying={isPlaying} />
        </Canvas>

        {/* Enhanced debug info */}
        {lipSyncData && (
          <div className="absolute top-2 left-2 bg-black/70 text-white p-3 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? "bg-green-400 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span>Lip-sync: {isPlaying ? "ACTIVE" : "IDLE"}</span>
            </div>
            <div>Cues: {lipSyncData.mouthCues?.length || 0}</div>
            <div>
              Duration: {lipSyncData.metadata?.duration?.toFixed(2) || "N/A"}s
            </div>
            <div>Mode: Auto-detected</div>
          </div>
        )}
      </div>
    );
  }
);

VideoChat.displayName = "VideoChat";

// Preload the models
useGLTF.preload("/684c911728e0929137bd898f.glb");
useGLTF.preload("/animation.glb");

export default VideoChat;
export type { LipSyncCue, LipSyncData, VideoChatRef };
