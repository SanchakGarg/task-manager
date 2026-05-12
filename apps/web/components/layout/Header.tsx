"use client";

import { useState } from "react";
import { Search, Plus, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  title: string;
  onSearch?: (q: string) => void;
  onNewTask?: () => void;
}

export function Header({ title, onSearch, onNewTask }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b-2 border-nb-border dark:border-border flex-shrink-0">
      <h1 className="text-xl font-black tracking-tight">{title}</h1>

      <div className="flex items-center gap-3">
        <AnimatePresence>
          {searchOpen && onSearch && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Input
                autoFocus
                placeholder="Search tasks..."
                onChange={(e) => onSearch(e.target.value)}
                onBlur={() => setSearchOpen(false)}
                className="h-9"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {onSearch && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex-shrink-0"
          >
            <Search size={16} />
          </Button>
        )}

        {onNewTask && (
          <Button onClick={onNewTask} size="sm">
            <Plus size={16} />
            New Task
          </Button>
        )}
      </div>
    </header>
  );
}
