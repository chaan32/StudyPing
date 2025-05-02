"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu, X, User, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const auth = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">StudyPing</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-primary">
              홈
            </Link>
            <Link href="/studies" className="text-gray-700 hover:text-primary">
              스터디 목록
            </Link>
            {auth.user && (
              <Link href="/my-studies" className="text-gray-700 hover:text-primary">
                내 스터디
              </Link>
            )}
            <Link href="/create" className="text-gray-700 hover:text-primary">
              스터디 생성
            </Link>

            {auth.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {/* 사용자 이름이 있으면 첫 글자를 표시, 없으면 기본값('U') 또는 다른 문자 표시 */}
                    <Avatar className="h-8 w-8">
                      {/* <AvatarImage src="/avatars/01.png" alt={auth.user.name || 'User'} /> */}
                      <AvatarFallback>{auth.user.name ? auth.user.name[0].toUpperCase() : '?'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {auth.user.name}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-studies" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>내 스터디</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={auth.logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default">
                  로그인
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              홈
            </Link>
            <Link
              href="/studies"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              스터디 목록
            </Link>
            {auth.user && (
              <Link
                href="/my-studies"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                내 스터디
              </Link>
            )}
            <Link
              href="/create"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              스터디 생성
            </Link>
            <div className="px-4 py-2">
              {auth.user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{auth.user.name ? auth.user.name[0].toUpperCase() : '?'}</AvatarFallback>
                    </Avatar>
                    <span>{auth.user.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={auth.logout}>
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="w-full">
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
